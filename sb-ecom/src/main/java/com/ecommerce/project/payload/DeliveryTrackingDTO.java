package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryTrackingDTO {
    private Long orderId;
    private LocalDate orderDate;
    private String orderStatus;
    private String carrierName;
    private String trackingNumber;
    private LocalDate estimatedDeliveryDate;
}
