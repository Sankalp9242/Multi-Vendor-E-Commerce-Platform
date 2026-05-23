package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserReportsResponse {
    private List<OrderDTO> orderHistoryReport;
    private List<PaymentHistoryDTO> paymentHistoryReport;
    private List<DeliveryTrackingDTO> deliveryTrackingReport;
    private List<MonthlySpendingDTO> monthlySpendingReport;
    private List<ReturnRefundReportDTO> returnRefundReport;
}
