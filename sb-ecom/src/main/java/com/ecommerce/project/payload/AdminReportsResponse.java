package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportsResponse {
    private Double totalPlatformSalesReport;
    private Double totalCommissionEarnedReport;
    private List<SellerPerformanceReportDTO> sellerPerformanceReport;
    private SellerStatusReportDTO sellerStatusReport;
    private List<ProductDTO> pendingProductApprovalsReport;
    private List<CategorySalesReportDTO> categoryWiseSalesReport;
    private List<SellerPerformanceReportDTO> topSellersReport;
    private List<TopProductReportDTO> topProductsReport;
}
