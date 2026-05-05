package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesReportDTO {
    private Long productId;
    private String productName;
    private String productStatus;
    private Integer currentStock;
    private Long unitsSold;
    private Double revenue;
}
