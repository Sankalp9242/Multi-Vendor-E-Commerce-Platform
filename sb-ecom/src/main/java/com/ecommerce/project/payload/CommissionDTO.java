package com.ecommerce.project.payload;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class CommissionDTO {
    @Min(0)
    @Max(100)
    private Double commissionPercentage;
}
