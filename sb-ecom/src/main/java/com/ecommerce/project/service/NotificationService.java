package com.ecommerce.project.service;

import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ReturnRequest;
import com.ecommerce.project.model.User;

import java.util.List;

public interface NotificationService {

    void sendBuyerOrderPlacedEmail(String buyerEmail, List<Order> orders);

    void sendSellerNewOrderEmail(User seller, Order order);

    void sendSellerApprovalEmail(User seller);

    void sendProductApprovedEmail(Product product);

    void sendOrderStatusEmail(Order order, String previousStatus);

    void sendReturnRequestedEmail(ReturnRequest returnRequest);

    void sendRefundProcessedEmail(ReturnRequest returnRequest);
}
