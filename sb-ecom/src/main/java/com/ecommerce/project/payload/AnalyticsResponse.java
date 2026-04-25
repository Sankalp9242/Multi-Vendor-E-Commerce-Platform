package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private String productCount;
    private String totalRevenue;
    private String totalOrders;
    private String pendingOrders;
    private String deliveredOrders;
    private String soldUnits;
    private String sellerCount;
    private String pendingProductApprovals;
    private String grossSales;
    private String sellerEarnings;
    private String commissionPercentage;
    private java.util.List<com.ecommerce.project.payload.OrderDTO> recentOrders;
    private java.util.List<com.ecommerce.project.payload.ProductDTO> pendingProducts;
}
