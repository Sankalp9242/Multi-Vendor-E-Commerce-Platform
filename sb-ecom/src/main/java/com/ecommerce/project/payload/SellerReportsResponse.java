package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerReportsResponse {
    private List<OrderDTO> ordersReport;
    private List<ProductSalesReportDTO> productSalesReport;
    private EarningsReportDTO earningsReport;
    private EarningsReportDTO commissionDeductionReport;
    private List<InventoryStockReportDTO> inventoryStockReport;
    private List<OrderStatusCountDTO> pendingVsDeliveredOrdersReport;
}
