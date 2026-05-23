package com.ecommerce.project.service;

import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.OrderItem;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ReturnRequest;
import com.ecommerce.project.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Value("${app.mail.support-name:Marketplace Support}")
    private String supportName;

    @Value("${app.mail.frontend-base-url:http://localhost:5173/}")
    private String frontendBaseUrl;

    @Override
    public void sendBuyerOrderPlacedEmail(String buyerEmail, List<Order> orders) {
        if (!canSend() || buyerEmail == null || buyerEmail.isBlank() || orders == null || orders.isEmpty()) {
            return;
        }

        StringBuilder body = new StringBuilder();
        body.append("Your order has been placed successfully.\n\n");
        body.append("Order summary:\n");

        for (Order order : orders) {
            body.append("- Order #").append(order.getOrderId())
                    .append(" | Amount: ").append(formatCurrency(order.getTotalAmount()))
                    .append(" | Status: ").append(order.getOrderStatus())
                    .append("\n");
        }

        body.append("\nYou can track your orders here: ")
                .append(trimTrailingSlash(frontendBaseUrl))
                .append("/profile/orders\n\n");
        body.append("Regards,\n").append(supportName);

        sendEmail(buyerEmail, "Your order has been placed", body.toString());
    }

    @Override
    public void sendSellerNewOrderEmail(User seller, Order order) {
        if (!canSend() || seller == null || order == null || seller.getEmail() == null || seller.getEmail().isBlank()) {
            return;
        }

        String storeName = seller.getStoreName() != null && !seller.getStoreName().isBlank()
                ? seller.getStoreName()
                : seller.getUserName();

        StringBuilder body = new StringBuilder();
        body.append("A new order has been placed for your store ").append(storeName).append(".\n\n")
                .append("Order ID: ").append(order.getOrderId()).append("\n")
                .append("Buyer: ").append(order.getEmail()).append("\n")
                .append("Amount: ").append(formatCurrency(order.getTotalAmount())).append("\n")
                .append("Status: ").append(order.getOrderStatus()).append("\n\n")
                .append("Manage the order here: ")
                .append(trimTrailingSlash(frontendBaseUrl))
                .append("/seller/orders\n\n")
                .append("Regards,\n").append(supportName);

        sendEmail(seller.getEmail(), "New order received", body.toString());
    }

    @Override
    public void sendSellerApprovalEmail(User seller) {
        if (!canSend() || seller == null || seller.getEmail() == null || seller.getEmail().isBlank()) {
            return;
        }

        StringBuilder body = new StringBuilder();
        body.append("Your seller account has been approved.\n\n")
                .append("You can now add and manage products from your seller dashboard.\n")
                .append("Open your dashboard here: ")
                .append(trimTrailingSlash(frontendBaseUrl))
                .append("/seller/dashboard\n\n")
                .append("Regards,\n").append(supportName);

        sendEmail(seller.getEmail(), "Seller account approved", body.toString());
    }

    @Override
    public void sendProductApprovedEmail(Product product) {
        if (!canSend() || product == null || product.getUser() == null || product.getUser().getEmail() == null || product.getUser().getEmail().isBlank()) {
            return;
        }

        StringBuilder body = new StringBuilder();
        body.append("Your product has been approved by the marketplace team.\n\n")
                .append("Product: ").append(product.getProductName()).append("\n")
                .append("Product ID: ").append(product.getProductId()).append("\n\n")
                .append("You can view it from your seller products page: ")
                .append(trimTrailingSlash(frontendBaseUrl))
                .append("/seller/products\n\n")
                .append("Regards,\n").append(supportName);

        sendEmail(product.getUser().getEmail(), "Product approved", body.toString());
    }

    @Override
    public void sendOrderStatusEmail(Order order, String previousStatus) {
        if (!canSend() || order == null || order.getEmail() == null || order.getEmail().isBlank()) {
            return;
        }

        if (!AppConstants.ORDER_STATUS_SHIPPED.equalsIgnoreCase(order.getOrderStatus())
                && !AppConstants.ORDER_STATUS_DELIVERED.equalsIgnoreCase(order.getOrderStatus())) {
            return;
        }

        StringBuilder body = new StringBuilder();
        body.append("Your order status has been updated.\n\n")
                .append("Order ID: ").append(order.getOrderId()).append("\n");

        if (previousStatus != null && !previousStatus.isBlank()) {
            body.append("Previous Status: ").append(previousStatus).append("\n");
        }

        body.append("Current Status: ").append(order.getOrderStatus()).append("\n");

        if (order.getTrackingNumber() != null && !order.getTrackingNumber().isBlank()) {
            body.append("Tracking Number: ").append(order.getTrackingNumber()).append("\n");
        }

        if (order.getCarrierName() != null && !order.getCarrierName().isBlank()) {
            body.append("Carrier: ").append(order.getCarrierName()).append("\n");
        }

        body.append("\nTrack your order here: ")
                .append(trimTrailingSlash(frontendBaseUrl))
                .append("/profile/orders\n\n")
                .append("Regards,\n").append(supportName);

        String subject = AppConstants.ORDER_STATUS_DELIVERED.equalsIgnoreCase(order.getOrderStatus())
                ? "Your order has been delivered"
                : "Your order has been shipped";

        sendEmail(order.getEmail(), subject, body.toString());
    }

    @Override
    public void sendReturnRequestedEmail(ReturnRequest returnRequest) {
        if (!canSend() || returnRequest == null) {
            return;
        }

        String buyerEmail = returnRequest.getBuyer() != null ? returnRequest.getBuyer().getEmail() : null;
        String sellerEmail = returnRequest.getSeller() != null ? returnRequest.getSeller().getEmail() : null;
        OrderItem orderItem = returnRequest.getOrderItem();
        String productName = orderItem != null && orderItem.getProduct() != null
                ? orderItem.getProduct().getProductName()
                : "Ordered item";

        String commonDetails = """
                Return details:
                Return ID: %d
                Order ID: %d
                Product: %s
                Reason: %s
                
                """.formatted(
                returnRequest.getId(),
                returnRequest.getOrder() != null ? returnRequest.getOrder().getOrderId() : null,
                productName,
                returnRequest.getReason()
        );

        if (buyerEmail != null && !buyerEmail.isBlank()) {
            sendEmail(
                    buyerEmail,
                    "Your return request has been submitted",
                    "We received your return request.\n\n" + commonDetails
                            + "You can track it here: " + trimTrailingSlash(frontendBaseUrl) + "/profile/returns\n\nRegards,\n" + supportName
            );
        }

        if (sellerEmail != null && !sellerEmail.isBlank()) {
            sendEmail(
                    sellerEmail,
                    "A return request needs your review",
                    "A buyer has submitted a return request for one of your products.\n\n" + commonDetails
                            + "Review it here: " + trimTrailingSlash(frontendBaseUrl) + "/seller/returns\n\nRegards,\n" + supportName
            );
        }
    }

    @Override
    public void sendRefundProcessedEmail(ReturnRequest returnRequest) {
        if (!canSend() || returnRequest == null || returnRequest.getBuyer() == null || returnRequest.getBuyer().getEmail() == null || returnRequest.getBuyer().getEmail().isBlank()) {
            return;
        }

        OrderItem orderItem = returnRequest.getOrderItem();
        double refundAmount = orderItem.getOrderedProductPrice() * orderItem.getQuantity();

        StringBuilder body = new StringBuilder();
        body.append("Your refund has been processed.\n\n")
                .append("Return ID: ").append(returnRequest.getId()).append("\n")
                .append("Order ID: ").append(returnRequest.getOrder().getOrderId()).append("\n")
                .append("Refund Amount: ").append(formatCurrency(refundAmount)).append("\n")
                .append("Status: ").append(returnRequest.getStatus()).append("\n\n")
                .append("You can review the return here: ")
                .append(trimTrailingSlash(frontendBaseUrl))
                .append("/profile/returns\n\n")
                .append("Regards,\n").append(supportName);

        sendEmail(returnRequest.getBuyer().getEmail(), "Refund processed", body.toString());
    }

    private boolean canSend() {
        return mailEnabled && mailSender != null && fromAddress != null && !fromAddress.isBlank();
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception exception) {
            log.warn("Unable to send email to {} with subject '{}': {}", to, subject, exception.getMessage());
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:5173";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String formatCurrency(Double amount) {
        return amount == null ? "0.00" : String.format("INR %.2f", amount);
    }
}
