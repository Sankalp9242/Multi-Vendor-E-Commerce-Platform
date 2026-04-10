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
import com.ecommerce.project.model.User;
import com.ecommerce.project.payload.OrderDTO;
import com.ecommerce.project.payload.OrderItemDTO;
import com.ecommerce.project.payload.OrderResponse;
import com.ecommerce.project.payload.PaymentDTO;
import com.ecommerce.project.payload.ProductDTO;
import com.ecommerce.project.repositories.AddressRepository;
import com.ecommerce.project.repositories.CartRepository;
import com.ecommerce.project.repositories.OrderItemRepository;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.PaymentRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.util.AuthUtil;
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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
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

        Order order = new Order();
        order.setEmail(emailId);
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(cart.getTotalPrice());
        order.setOrderStatus(AppConstants.ORDER_STATUS_PENDING);
        order.setAddress(address);

        Payment payment = new Payment(paymentMethod, pgPaymentId, pgStatus, pgResponseMessage, pgName);
        payment.setOrder(order);
        payment = paymentRepository.save(payment);
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            validateOrderItem(product, cartItem);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }

        orderItems = orderItemRepository.saveAll(orderItems);
        savedOrder.setOrderItems(orderItems);

        for (CartItem item : cartItems) {
            int quantity = item.getQuantity();
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() - quantity);
            productRepository.save(product);
            cartService.deleteProductFromCart(cart.getCartId(), product.getProductId());
        }

        return mapOrderToDto(savedOrder, null);
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
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        String normalizedCurrentStatus = normalizeOrderStatus(order.getOrderStatus());
        String normalizedNextStatus = normalizeOrderStatus(status);

        validateOrderStatusTransition(normalizedCurrentStatus, normalizedNextStatus);

        order.setOrderStatus(normalizedNextStatus);
        orderRepository.save(order);
        return mapOrderToDto(order, null);
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

        if (order.getPayment() != null) {
            orderDTO.setPayment(modelMapper.map(order.getPayment(), PaymentDTO.class));
        }

        if (order.getAddress() != null) {
            orderDTO.setAddressId(order.getAddress().getAddressId());
        }

        return orderDTO;
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
            case AppConstants.ORDER_STATUS_DELIVERED, AppConstants.ORDER_STATUS_CANCELLED -> Set.of();
            default -> throw new APIException("Invalid order status: " + currentStatus);
        };

        if (!allowedNextStatuses.contains(nextStatus)) {
            Set<String> displayStatuses = new LinkedHashSet<>(allowedNextStatuses);
            throw new APIException("Invalid order status transition from "
                    + currentStatus + " to " + nextStatus
                    + ". Allowed next statuses: " + displayStatuses);
        }
    }
}
