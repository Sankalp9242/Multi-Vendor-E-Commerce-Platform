package com.ecommerce.project.payload;

import java.time.LocalDate;

import lombok.Data;

@Data
public class OrderStatusUpdateDto {
    private String status;
    private String carrierName;
    private String trackingNumber;
    private LocalDate estimatedDeliveryDate;
}
