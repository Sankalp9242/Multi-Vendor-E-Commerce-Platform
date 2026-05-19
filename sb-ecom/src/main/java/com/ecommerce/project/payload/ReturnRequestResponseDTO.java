package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequestResponseDTO {
    private Long id;
    private Long orderId;
    private Long orderItemId;
    private Long buyerId;
    private Long sellerId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double orderedProductPrice;
    private Double refundAmount;
    private String buyerEmail;
    private String sellerStoreName;
    private String reason;
    private String description;
    private String imageUrl;
    private String status;
    private String orderStatus;
    private LocalDate deliveredAt;
    private String sellerComment;
    private String adminComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
