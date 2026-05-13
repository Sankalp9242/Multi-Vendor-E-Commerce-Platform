package com.ecommerce.project.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SellerProfileUpdateDTO {

    @NotBlank(message = "Store name is required")
    @Size(min = 3, max = 100, message = "Store name must be between 3 and 100 characters")
    private String storeName;

    @NotBlank(message = "Store description is required")
    @Size(min = 10, max = 1000, message = "Store description must be between 10 and 1000 characters")
    private String storeDescription;
}
