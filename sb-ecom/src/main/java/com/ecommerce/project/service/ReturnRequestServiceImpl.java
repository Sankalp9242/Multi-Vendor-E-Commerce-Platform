package com.ecommerce.project.service;

import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResourceNotFoundException;
import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.OrderItem;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ReturnRequest;
import com.ecommerce.project.model.ReturnStatus;
import com.ecommerce.project.model.User;
import com.ecommerce.project.payload.ReturnRequestResponseDTO;
import com.ecommerce.project.repositories.OrderItemRepository;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.PaymentRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.repositories.ReturnRequestRepository;
import com.ecommerce.project.repositories.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ReturnRequestServiceImpl implements ReturnRequestService {

    private static final Set<ReturnStatus> REFUND_COMPLETED_STATUSES = EnumSet.of(
            ReturnStatus.REFUND_PROCESSED,
            ReturnStatus.CLOSED
    );

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public ReturnRequestResponseDTO createReturn(Long buyerId, Long orderId, Long orderItemId, String reason, String description, String imageUrl) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", buyerId));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "orderItemId", orderItemId));

        validateBuyerReturnRequest(buyer, order, orderItem, reason);

        ReturnRequest request = new ReturnRequest();
        request.setOrder(order);
        request.setOrderItem(orderItem);
        request.setBuyer(buyer);
        request.setSeller(orderItem.getProduct().getUser());
        request.setReason(reason.trim());
        request.setDescription(hasText(description) ? description.trim() : null);
        request.setImageUrl(hasText(imageUrl) ? imageUrl.trim() : null);
        request.setStatus(ReturnStatus.REQUESTED);

        ReturnRequest savedRequest = returnRequestRepository.save(request);
        notificationService.sendReturnRequestedEmail(savedRequest);
        return toDto(savedRequest);
    }

    @Override
    public List<ReturnRequestResponseDTO> getBuyerReturns(Long buyerId) {
        return returnRequestRepository.findAllByBuyerId(buyerId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<ReturnRequestResponseDTO> getSellerReturns(Long sellerId) {
        return returnRequestRepository.findAllBySellerId(sellerId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<ReturnRequestResponseDTO> getAdminReviewReturns() {
        return returnRequestRepository.findAllUnderReview().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public ReturnRequestResponseDTO approveReturn(Long returnRequestId, Long sellerId, String comment) {
        ReturnRequest request = getSellerOwnedReturn(returnRequestId, sellerId);
        ensureStatus(request, ReturnStatus.REQUESTED, "Only requested returns can be approved");
        request.setStatus(ReturnStatus.APPROVED);
        request.setSellerComment(trimOrNull(comment));
        return toDto(returnRequestRepository.save(request));
    }

    @Override
    @Transactional
    public ReturnRequestResponseDTO rejectReturn(Long returnRequestId, Long sellerId, String comment) {
        ReturnRequest request = getSellerOwnedReturn(returnRequestId, sellerId);
        ensureStatus(request, ReturnStatus.REQUESTED, "Only requested returns can be rejected");
        if (!hasText(comment)) {
            throw new APIException("Seller comment is required when rejecting a return");
        }
        request.setStatus(ReturnStatus.REJECTED);
        request.setSellerComment(comment.trim());
        return toDto(returnRequestRepository.save(request));
    }

    @Override
    @Transactional
    public ReturnRequestResponseDTO updateSellerReturnStatus(Long returnRequestId, Long sellerId, String nextStatus, String comment) {
        ReturnRequest request = getSellerOwnedReturn(returnRequestId, sellerId);
        ReturnStatus currentStatus = request.getStatus();
        ReturnStatus targetStatus = parseReturnStatus(nextStatus);

        Set<ReturnStatus> allowedNextStatuses = switch (currentStatus) {
            case APPROVED -> EnumSet.of(ReturnStatus.PICKUP_SCHEDULED);
            case PICKUP_SCHEDULED -> EnumSet.of(ReturnStatus.PRODUCT_RECEIVED);
            case PRODUCT_RECEIVED,
                 REFUND_PROCESSED -> EnumSet.noneOf(ReturnStatus.class);
            default -> EnumSet.noneOf(ReturnStatus.class);
        };

        if (!allowedNextStatuses.contains(targetStatus)) {
            throw new APIException("Invalid return status transition from " + currentStatus + " to " + targetStatus);
        }

        request.setStatus(targetStatus);
        if (hasText(comment)) {
            request.setSellerComment(comment.trim());
        }

        return toDto(returnRequestRepository.save(request));
    }

    @Override
    @Transactional
    public ReturnRequestResponseDTO disputeReturn(Long returnRequestId, Long buyerId, String comment) {
        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", returnRequestId));

        if (!request.getBuyer().getUserId().equals(buyerId)) {
            throw new APIException("You are not authorized to dispute this return");
        }

        ensureStatus(request, ReturnStatus.REJECTED, "Only rejected returns can be disputed");

        request.setStatus(ReturnStatus.UNDER_REVIEW);
        request.setAdminComment(trimOrNull(comment));
        return toDto(returnRequestRepository.save(request));
    }

    @Override
    @Transactional
    public ReturnRequestResponseDTO adminReview(Long returnRequestId, boolean approve, String comment) {
        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", returnRequestId));

        ensureStatus(request, ReturnStatus.UNDER_REVIEW, "Only disputed returns can be reviewed by admin");
        request.setAdminComment(trimOrNull(comment));
        request.setStatus(approve ? ReturnStatus.APPROVED : ReturnStatus.REJECTED);
        return toDto(returnRequestRepository.save(request));
    }

    @Override
    @Transactional
    public ReturnRequestResponseDTO processRefund(Long returnRequestId, String comment) {
        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", returnRequestId));

        ensureStatus(request, ReturnStatus.PRODUCT_RECEIVED,
                "Refund can only be processed after the seller confirms product receipt");

        processGatewayRefund(request);
        restockReturnedItem(request.getOrderItem());

        request.setStatus(ReturnStatus.REFUND_PROCESSED);
        request.setAdminComment(trimOrNull(comment));
        ReturnRequest savedRequest = returnRequestRepository.save(request);
        syncOrderPaymentRefundStatus(savedRequest.getOrder());
        notificationService.sendRefundProcessedEmail(savedRequest);
        return toDto(savedRequest);
    }

    @Override
    @Transactional
    public ReturnRequestResponseDTO closeReturn(Long returnRequestId, String comment) {
        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", returnRequestId));

        ensureStatus(request, ReturnStatus.REFUND_PROCESSED,
                "Only refund-processed returns can be closed");

        request.setStatus(ReturnStatus.CLOSED);
        request.setAdminComment(trimOrNull(comment));
        return toDto(returnRequestRepository.save(request));
    }

    private void validateBuyerReturnRequest(User buyer, Order order, OrderItem orderItem, String reason) {
        if (!buyer.getEmail().equalsIgnoreCase(order.getEmail())) {
            throw new APIException("You are not authorized to create a return for this order");
        }

        if (!orderItem.getOrder().getOrderId().equals(order.getOrderId())) {
            throw new APIException("Order item does not belong to the selected order");
        }

        if (!AppConstants.ORDER_STATUS_DELIVERED.equalsIgnoreCase(order.getOrderStatus())) {
            throw new APIException("Return requests are only allowed for delivered orders");
        }

        if (order.getDeliveredAt() == null) {
            throw new APIException("Delivered date is missing for this order");
        }

        if (order.getDeliveredAt().plusDays(AppConstants.RETURN_WINDOW_DAYS).isBefore(LocalDate.now())) {
            throw new APIException("Return window has expired for this order item");
        }

        if (!hasText(reason)) {
            throw new APIException("Return reason is required");
        }

        if (orderItem.getProduct() == null || orderItem.getProduct().getUser() == null) {
            throw new APIException("Seller information is missing for this order item");
        }

        if (returnRequestRepository.existsByOrderItemOrderItemId(orderItem.getOrderItemId())) {
            throw new APIException("A return request already exists for this order item");
        }
    }

    private ReturnRequest getSellerOwnedReturn(Long returnRequestId, Long sellerId) {
        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", returnRequestId));

        if (!request.getSeller().getUserId().equals(sellerId)) {
            throw new APIException("You are not authorized to manage this return");
        }

        return request;
    }

    private ReturnStatus parseReturnStatus(String status) {
        if (!hasText(status)) {
            throw new APIException("Return status cannot be empty");
        }

        try {
            return ReturnStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new APIException("Invalid return status: " + status);
        }
    }

    private void ensureStatus(ReturnRequest request, ReturnStatus expected, String message) {
        if (request.getStatus() != expected) {
            throw new APIException(message);
        }
    }

    private void restockReturnedItem(OrderItem orderItem) {
        Product product = orderItem.getProduct();
        product.setQuantity(product.getQuantity() + orderItem.getQuantity());
        productRepository.save(product);
    }

    private ReturnRequestResponseDTO toDto(ReturnRequest request) {
        OrderItem orderItem = request.getOrderItem();
        Product product = orderItem.getProduct();
        Order order = request.getOrder();

        return new ReturnRequestResponseDTO(
                request.getId(),
                order.getOrderId(),
                orderItem.getOrderItemId(),
                request.getBuyer().getUserId(),
                request.getSeller().getUserId(),
                product.getProductId(),
                product.getProductName(),
                orderItem.getQuantity(),
                orderItem.getOrderedProductPrice(),
                orderItem.getOrderedProductPrice() * orderItem.getQuantity(),
                request.getBuyer().getEmail(),
                request.getSeller().getStoreName(),
                request.getReason(),
                request.getDescription(),
                request.getImageUrl(),
                request.getStatus().name(),
                order.getOrderStatus(),
                order.getDeliveredAt(),
                request.getSellerComment(),
                request.getAdminComment(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String trimOrNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private void syncOrderPaymentRefundStatus(Order order) {
        if (order.getPayment() == null) {
            return;
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderId(order.getOrderId());
        boolean allItemsRefunded = orderItems.stream()
                .allMatch(orderItem -> returnRequestRepository.existsRefundedReturnForOrderItem(
                        orderItem.getOrderItemId(),
                        REFUND_COMPLETED_STATUSES
                ));

        order.getPayment().setPgStatus(allItemsRefunded ? "refunded" : "partially_refunded");
        order.getPayment().setPgResponseMessage(allItemsRefunded
                ? "Refund completed for all returned items"
                : "Refund completed for one or more returned items");
        paymentRepository.save(order.getPayment());
    }

    private void processGatewayRefund(ReturnRequest request) {
        Order order = request.getOrder();
        if (order.getPayment() == null) {
            return;
        }

        String method = trimOrNull(order.getPayment().getPaymentMethod());
        String paymentIntentId = trimOrNull(order.getPayment().getPgPaymentId());

        if (method == null || paymentIntentId == null) {
            return;
        }

        if ("online".equalsIgnoreCase(method) || "stripe".equalsIgnoreCase(method)) {
            try {
                Long refundAmountInPaise = Math.round(
                        request.getOrderItem().getOrderedProductPrice()
                                * request.getOrderItem().getQuantity()
                                * 100
                );
                Refund refund = stripeService.refundPaymentIntent(paymentIntentId, refundAmountInPaise);
                order.getPayment().setPgResponseMessage("Stripe refund processed: " + refund.getId());
            } catch (StripeException exception) {
                throw new APIException("Unable to process Stripe refund for this return");
            }
        }
    }
}
