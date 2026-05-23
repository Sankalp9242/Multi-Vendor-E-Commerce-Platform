package com.ecommerce.project.service;

import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResourceNotFoundException;
import com.ecommerce.project.model.Address;
import com.ecommerce.project.model.Cart;
import com.ecommerce.project.model.CartItem;
import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.OrderItem;
import com.ecommerce.project.model.Payment;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ProductStatus;
import com.ecommerce.project.model.User;
import com.ecommerce.project.payload.OrderDTO;
import com.ecommerce.project.payload.OrderItemDTO;
import com.ecommerce.project.payload.OrderResponse;
import com.ecommerce.project.payload.PaymentDTO;
import com.ecommerce.project.payload.ProductDTO;
import com.ecommerce.project.repositories.AddressRepository;
import com.ecommerce.project.repositories.CartItemRepository;
import com.ecommerce.project.repositories.CartRepository;
import com.ecommerce.project.repositories.OrderItemRepository;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.PaymentRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.util.AuthUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Set<String> VALID_ORDER_STATUSES = Set.of(
            AppConstants.ORDER_STATUS_PENDING,
            AppConstants.ORDER_STATUS_CONFIRMED,
            AppConstants.ORDER_STATUS_SHIPPED,
            AppConstants.ORDER_STATUS_DELIVERED,
            AppConstants.ORDER_STATUS_CANCELLED
    );

    @Autowired
    CartRepository cartRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    CartService cartService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    AuthUtil authUtil;

    @Autowired
    StripeService stripeService;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage) {
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new APIException("Cart is empty");
        }

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        if (address.getUser() == null || !address.getUser().getEmail().equals(emailId)) {
            throw new APIException("Address does not belong to the logged-in user");
        }

        PaymentVerificationResult paymentVerification = verifyPayment(cart, paymentMethod, pgName, pgPaymentId);
        List<SellerOrderAllocation> sellerAllocations = groupCartItemsBySeller(cartItems);
        List<Order> createdOrders = new ArrayList<>();

        for (SellerOrderAllocation allocation : sellerAllocations) {
            Order order = new Order();
            order.setEmail(emailId);
            order.setOrderDate(LocalDate.now());
            order.setSubtotalAmount(allocation.subtotalAmount());
            order.setDiscountAmount(allocation.discountAmount());
            order.setCouponCode(cart.getAppliedCouponCode());
            order.setTotalAmount(allocation.totalAmount());
            order.setOrderStatus(resolveInitialOrderStatus(paymentVerification.paymentStatus()));
            order.setAddress(address);

            Payment payment = new Payment(
                    paymentMethod,
                    paymentVerification.paymentId(),
                    paymentVerification.paymentStatus(),
                    paymentVerification.responseMessage(),
                    paymentVerification.gatewayName()
            );
            payment.setOrder(order);
            payment = paymentRepository.save(payment);
            order.setPayment(payment);

            Order savedOrder = orderRepository.save(order);
            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem cartItem : allocation.cartItems()) {
                Product product = cartItem.getProduct();

                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(product);
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setDiscount(cartItem.getDiscount());
                orderItem.setOrderedProductPrice(cartItem.getProductPrice());
                orderItem.setOrder(savedOrder);
                orderItems.add(orderItem);

                product.setQuantity(product.getQuantity() - cartItem.getQuantity());
                productRepository.save(product);
            }

            savedOrder.setOrderItems(orderItemRepository.saveAll(orderItems));
            createdOrders.add(savedOrder);
        }

        cartItemRepository.deleteAllByCartId(cart.getCartId());
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cart.setDiscountAmount(0.0);
        cart.setAppliedCouponCode(null);
        cartRepository.save(cart);

        notificationService.sendBuyerOrderPlacedEmail(emailId, createdOrders);
        createdOrders.forEach(order -> {
            User seller = resolveSellerFromOrder(order);
            if (seller != null) {
                notificationService.sendSellerNewOrderEmail(seller, order);
            }
        });

        return mapOrderToDto(createdOrders.getFirst(), null);
    }

    @Override
    public OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Order> pageOrders = orderRepository.findAll(pageDetails);

        return buildOrderResponse(pageOrders, null);
    }

    @Override
    public OrderDTO updateOrder(Long orderId, String status) {
        return updateOrder(orderId, status, null, null, null);
    }

    @Override
    public OrderDTO updateOrder(Long orderId, String status, String carrierName, String trackingNumber, LocalDate estimatedDeliveryDate) {
        return updateOrderInternal(orderId, status, null, carrierName, trackingNumber, estimatedDeliveryDate);
    }

    @Override
    public OrderDTO updateOrderForSeller(Long orderId, String status, Long sellerId) {
        return updateOrderForSeller(orderId, status, sellerId, null, null, null);
    }

    @Override
    public OrderDTO updateOrderForSeller(Long orderId, String status, Long sellerId, String carrierName, String trackingNumber, LocalDate estimatedDeliveryDate) {
        if (!orderRepository.existsOrderForSeller(orderId, sellerId)) {
            throw new APIException("You are not authorized to update this order");
        }

        return updateOrderInternal(orderId, status, sellerId, carrierName, trackingNumber, estimatedDeliveryDate);
    }

    @Override
    @Transactional
    public void syncStripePaymentStatus(String paymentIntentId, String paymentStatus, String responseMessage) {
        paymentRepository.findAllByPgPaymentId(paymentIntentId).forEach(payment -> {
            payment.setPgStatus(paymentStatus);
            payment.setPgResponseMessage(responseMessage);
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order == null) {
                return;
            }

            String normalizedPaymentStatus = paymentStatus == null
                    ? ""
                    : paymentStatus.trim().toLowerCase(Locale.ROOT);

            if ("succeeded".equals(normalizedPaymentStatus)
                    && AppConstants.ORDER_STATUS_PENDING.equals(normalizeOrderStatus(order.getOrderStatus()))) {
                order.setOrderStatus(AppConstants.ORDER_STATUS_CONFIRMED);
                orderRepository.save(order);
            }

            if (("canceled".equals(normalizedPaymentStatus) || "failed".equals(normalizedPaymentStatus))
                    && !AppConstants.ORDER_STATUS_DELIVERED.equals(normalizeOrderStatus(order.getOrderStatus()))) {
                order.setOrderStatus(AppConstants.ORDER_STATUS_CANCELLED);
                orderRepository.save(order);
            }
        });
    }

    @Override
    public OrderResponse getAllSellerOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        User seller = authUtil.loggedInUser();

        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Order> pageOrders = orderRepository.findOrdersBySeller(seller.getUserId(), pageable);

        return buildOrderResponse(pageOrders, seller.getUserId());
    }

    @Override
    public OrderResponse getOrdersByUser(String email, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Order> orderPage = orderRepository.findByEmail(email, pageable);

        return buildOrderResponse(orderPage, null);
    }

    private void validateOrderItem(Product product, CartItem cartItem) {
        if (product.getUser() == null) {
            throw new APIException("Product is not available");
        }

        if (product.getProductStatus() != ProductStatus.ACTIVE || Boolean.TRUE.equals(product.getDeleted())) {
            throw new APIException("Product is not available: " + product.getProductName());
        }

        if (product.getUser().getUserId().equals(authUtil.loggedInUserId())) {
            throw new APIException("You cannot purchase your own product: " + product.getProductName());
        }

        if (cartItem.getQuantity() == null || cartItem.getQuantity() <= 0) {
            throw new APIException("Invalid quantity for product: " + product.getProductName());
        }

        if (product.getQuantity() < cartItem.getQuantity()) {
            throw new APIException("Insufficient stock for product: " + product.getProductName());
        }
    }

    private OrderDTO updateOrderInternal(Long orderId, String status, Long sellerId,
                                         String carrierName, String trackingNumber, LocalDate estimatedDeliveryDate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        String normalizedCurrentStatus = normalizeOrderStatus(order.getOrderStatus());
        String normalizedNextStatus = normalizeOrderStatus(status);

        validateOrderStatusTransition(normalizedCurrentStatus, normalizedNextStatus);
        applyShippingDetails(order, normalizedNextStatus, carrierName, trackingNumber, estimatedDeliveryDate);

        order.setOrderStatus(normalizedNextStatus);
        orderRepository.save(order);
        notificationService.sendOrderStatusEmail(order, normalizedCurrentStatus);
        return mapOrderToDto(order, sellerId);
    }

    private PaymentVerificationResult verifyPayment(Cart cart, String paymentMethod, String pgName, String pgPaymentId) {
        if (!"online".equalsIgnoreCase(paymentMethod) && !"stripe".equalsIgnoreCase(paymentMethod)) {
            return new PaymentVerificationResult(
                    pgName != null && !pgName.isBlank() ? pgName : paymentMethod,
                    pgPaymentId,
                    "PENDING",
                    "Payment verification skipped for non-Stripe flow"
            );
        }

        if (pgPaymentId == null || pgPaymentId.isBlank()) {
            throw new APIException("Stripe payment ID is required");
        }

        try {
            PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(pgPaymentId);
            Long expectedAmount = Math.round(cart.getTotalPrice() * 100);

            if (!"succeeded".equalsIgnoreCase(paymentIntent.getStatus())) {
                throw new APIException("Stripe payment is not successful");
            }

            if (!expectedAmount.equals(paymentIntent.getAmount())) {
                throw new APIException("Stripe payment amount does not match cart total");
            }

            return new PaymentVerificationResult(
                    "Stripe",
                    paymentIntent.getId(),
                    paymentIntent.getStatus(),
                    "Payment verified with Stripe"
            );
        } catch (StripeException e) {
            throw new APIException("Unable to verify Stripe payment");
        }
    }

    private double calculateCartSubtotal(List<CartItem> cartItems) {
        return cartItems.stream()
                .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
                .sum();
    }

    private List<SellerOrderAllocation> groupCartItemsBySeller(List<CartItem> cartItems) {
        Map<Long, List<CartItem>> cartItemsBySeller = new LinkedHashMap<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            validateOrderItem(product, cartItem);
            cartItemsBySeller
                    .computeIfAbsent(product.getUser().getUserId(), ignored -> new ArrayList<>())
                    .add(cartItem);
        }

        double cartSubtotal = calculateCartSubtotal(cartItems);
        double remainingDiscount = defaultDouble(cartItems.getFirst().getCart().getDiscountAmount());
        double remainingTotal = defaultDouble(cartItems.getFirst().getCart().getTotalPrice());
        List<Map.Entry<Long, List<CartItem>>> sellerEntries = new ArrayList<>(cartItemsBySeller.entrySet());
        List<SellerOrderAllocation> allocations = new ArrayList<>();

        for (int index = 0; index < sellerEntries.size(); index++) {
            Map.Entry<Long, List<CartItem>> entry = sellerEntries.get(index);
            List<CartItem> sellerCartItems = entry.getValue();
            double sellerSubtotal = roundCurrency(calculateCartSubtotal(sellerCartItems));
            boolean lastSeller = index == sellerEntries.size() - 1;

            double sellerDiscount;
            double sellerTotal;
            if (lastSeller) {
                sellerDiscount = roundCurrency(remainingDiscount);
                sellerTotal = roundCurrency(remainingTotal);
            } else {
                double discountShare = cartSubtotal == 0.0
                        ? 0.0
                        : defaultDouble(sellerSubtotal * defaultDouble(cartItems.getFirst().getCart().getDiscountAmount()) / cartSubtotal);
                sellerDiscount = roundCurrency(discountShare);
                sellerTotal = roundCurrency(sellerSubtotal - sellerDiscount);
                remainingDiscount = roundCurrency(remainingDiscount - sellerDiscount);
                remainingTotal = roundCurrency(remainingTotal - sellerTotal);
            }

            allocations.add(new SellerOrderAllocation(sellerCartItems, sellerSubtotal, sellerDiscount, sellerTotal));
        }

        return allocations;
    }

    private double defaultDouble(Double value) {
        return value == null ? 0.0 : value;
    }

    private double roundCurrency(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    private String resolveInitialOrderStatus(String paymentStatus) {
        if (paymentStatus != null && "succeeded".equalsIgnoreCase(paymentStatus.trim())) {
            return AppConstants.ORDER_STATUS_CONFIRMED;
        }

        return AppConstants.ORDER_STATUS_PENDING;
    }

    private OrderResponse buildOrderResponse(Page<Order> pageOrders, Long sellerId) {
        List<OrderDTO> orderDTOs = pageOrders.getContent().stream()
                .map(order -> mapOrderToDto(order, sellerId))
                .toList();

        OrderResponse response = new OrderResponse();
        response.setContent(orderDTOs);
        response.setPageNumber(pageOrders.getNumber());
        response.setPageSize(pageOrders.getSize());
        response.setTotalElements(pageOrders.getTotalElements());
        response.setTotalPages(pageOrders.getTotalPages());
        response.setLastPage(pageOrders.isLast());
        return response;
    }

    private OrderDTO mapOrderToDto(Order order, Long sellerId) {
        OrderDTO orderDTO = modelMapper.map(order, OrderDTO.class);
        orderDTO.setOrderStatus(normalizeOrderStatus(order.getOrderStatus()));

        List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                .filter(orderItem -> sellerId == null
                        || orderItem.getProduct().getUser().getUserId().equals(sellerId))
                .map(orderItem -> {
                    OrderItemDTO orderItemDTO = modelMapper.map(orderItem, OrderItemDTO.class);
                    orderItemDTO.setProduct(modelMapper.map(orderItem.getProduct(), ProductDTO.class));
                    return orderItemDTO;
                })
                .toList();

        orderDTO.setOrderItems(orderItemDTOs);
        if (sellerId != null) {
            double sellerTotal = orderItemDTOs.stream()
                    .mapToDouble(orderItemDTO -> orderItemDTO.getOrderedProductPrice() * orderItemDTO.getQuantity())
                    .sum();
            orderDTO.setTotalAmount(sellerTotal);
        }

        if (order.getPayment() != null) {
            orderDTO.setPayment(modelMapper.map(order.getPayment(), PaymentDTO.class));
        }

        if (order.getAddress() != null) {
            orderDTO.setAddressId(order.getAddress().getAddressId());
        }

        orderDTO.setCarrierName(order.getCarrierName());
        orderDTO.setTrackingNumber(order.getTrackingNumber());
        orderDTO.setEstimatedDeliveryDate(order.getEstimatedDeliveryDate());

        return orderDTO;
    }

    private void applyShippingDetails(Order order, String nextStatus, String carrierName,
                                      String trackingNumber, LocalDate estimatedDeliveryDate) {
        boolean requiresShippingInfo = AppConstants.ORDER_STATUS_SHIPPED.equals(nextStatus)
                || AppConstants.ORDER_STATUS_DELIVERED.equals(nextStatus);

        String resolvedCarrierName = hasText(carrierName) ? carrierName.trim() : order.getCarrierName();
        String resolvedTrackingNumber = hasText(trackingNumber) ? trackingNumber.trim() : order.getTrackingNumber();
        LocalDate resolvedEstimatedDeliveryDate = estimatedDeliveryDate != null
                ? estimatedDeliveryDate
                : order.getEstimatedDeliveryDate();

        if (requiresShippingInfo) {
            if (!hasText(resolvedCarrierName)) {
                throw new APIException("Carrier name is required for shipped or delivered orders");
            }

            if (!hasText(resolvedTrackingNumber)) {
                throw new APIException("Tracking number is required for shipped or delivered orders");
            }
        }

        order.setCarrierName(resolvedCarrierName);
        order.setTrackingNumber(resolvedTrackingNumber);
        order.setEstimatedDeliveryDate(resolvedEstimatedDeliveryDate);
        if (AppConstants.ORDER_STATUS_DELIVERED.equals(nextStatus)) {
            order.setDeliveredAt(LocalDate.now());
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private User resolveSellerFromOrder(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return null;
        }

        Product product = order.getOrderItems().getFirst().getProduct();
        return product != null ? product.getUser() : null;
    }

    private String normalizeOrderStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new APIException("Order status cannot be empty");
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if ("ACCEPTED".equals(normalized)) {
            normalized = AppConstants.ORDER_STATUS_CONFIRMED;
        }

        if (!VALID_ORDER_STATUSES.contains(normalized)) {
            throw new APIException("Invalid order status: " + status);
        }

        return normalized;
    }

    private void validateOrderStatusTransition(String currentStatus, String nextStatus) {
        if (currentStatus.equals(nextStatus)) {
            return;
        }

        Set<String> allowedNextStatuses = switch (currentStatus) {
            case AppConstants.ORDER_STATUS_PENDING -> Set.of(
                    AppConstants.ORDER_STATUS_CONFIRMED,
                    AppConstants.ORDER_STATUS_CANCELLED
            );
            case AppConstants.ORDER_STATUS_CONFIRMED -> Set.of(
                    AppConstants.ORDER_STATUS_SHIPPED,
                    AppConstants.ORDER_STATUS_CANCELLED
            );
            case AppConstants.ORDER_STATUS_SHIPPED -> Set.of(AppConstants.ORDER_STATUS_DELIVERED);
            case AppConstants.ORDER_STATUS_DELIVERED,
                 AppConstants.ORDER_STATUS_CANCELLED -> Set.of();
            default -> throw new APIException("Invalid order status: " + currentStatus);
        };

        if (!allowedNextStatuses.contains(nextStatus)) {
            Set<String> displayStatuses = new LinkedHashSet<>(allowedNextStatuses);
            throw new APIException("Invalid order status transition from "
                    + currentStatus + " to " + nextStatus
                    + ". Allowed next statuses: " + displayStatuses);
        }
    }

    private record PaymentVerificationResult(
            String gatewayName,
            String paymentId,
            String paymentStatus,
            String responseMessage
    ) {
    }

    private record SellerOrderAllocation(
            List<CartItem> cartItems,
            double subtotalAmount,
            double discountAmount,
            double totalAmount
    ) {
    }
}
