package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryDTO {
    private Long orderId;
    private LocalDate orderDate;
    private Double amount;
    private String paymentMethod;
    private String paymentGateway;
    private String paymentStatus;
    private String paymentReference;
}
