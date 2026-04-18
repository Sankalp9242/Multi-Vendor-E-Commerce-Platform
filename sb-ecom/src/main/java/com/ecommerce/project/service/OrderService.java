package com.ecommerce.project.service;

import com.ecommerce.project.payload.OrderDTO;
import com.ecommerce.project.payload.OrderResponse;
import jakarta.transaction.Transactional;

public interface OrderService {
    @Transactional
    OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage);

    OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    OrderDTO updateOrder(Long orderId, String status);
    OrderDTO updateOrder(Long orderId, String status, String carrierName, String trackingNumber, java.time.LocalDate estimatedDeliveryDate);

    OrderDTO updateOrderForSeller(Long orderId, String status, Long sellerId);
    OrderDTO updateOrderForSeller(Long orderId, String status, Long sellerId, String carrierName, String trackingNumber, java.time.LocalDate estimatedDeliveryDate);

    void syncStripePaymentStatus(String paymentIntentId, String paymentStatus, String responseMessage);

    OrderResponse getAllSellerOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    OrderResponse getOrdersByUser(
            String email,
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder
    );

}
