package com.ecommerce.project.payload;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    private Long couponId;

    @NotBlank(message = "Coupon code is required")
    private String code;

    private String description;

    @NotNull(message = "Discount percentage is required")
    @DecimalMin(value = "0.01", message = "Discount percentage must be greater than 0")
    @DecimalMax(value = "100.0", message = "Discount percentage cannot exceed 100")
    private Double discountPercentage;

    @NotNull(message = "Minimum order amount is required")
    @DecimalMin(value = "0.0", message = "Minimum order amount cannot be negative")
    private Double minimumOrderAmount;

    private LocalDate expiryDate;
    private Boolean active = true;
}
