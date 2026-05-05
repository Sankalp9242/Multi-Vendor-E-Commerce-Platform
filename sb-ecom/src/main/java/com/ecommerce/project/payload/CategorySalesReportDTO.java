package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySalesReportDTO {
    private Long categoryId;
    private String categoryName;
    private Long unitsSold;
    private Double totalRevenue;
}
