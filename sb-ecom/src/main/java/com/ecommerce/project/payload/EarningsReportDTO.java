package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EarningsReportDTO {
    private Double grossSales;
    private Double commissionPercentage;
    private Double commissionDeduction;
    private Double netEarnings;
}
