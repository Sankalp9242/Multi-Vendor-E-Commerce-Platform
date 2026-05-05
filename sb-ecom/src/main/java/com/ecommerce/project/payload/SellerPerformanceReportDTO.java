package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerPerformanceReportDTO {
    private Long sellerId;
    private String sellerName;
    private String storeName;
    private Long totalOrders;
    private Double grossSales;
    private Double commissionEarned;
    private Double netEarnings;
}
