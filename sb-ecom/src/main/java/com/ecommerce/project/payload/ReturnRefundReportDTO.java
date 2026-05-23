package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRefundReportDTO {
    private Long returnId;
    private Long orderId;
    private Long orderItemId;
    private String productName;
    private String buyerEmail;
    private String sellerName;
    private String reason;
    private String returnStatus;
    private Double refundAmount;
    private LocalDateTime requestedAt;
    private LocalDateTime updatedAt;
}
