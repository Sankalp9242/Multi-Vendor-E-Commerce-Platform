package com.ecommerce.project.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReturnRequestDTO {
    @NotNull
    private Long orderId;

    @NotNull
    private Long orderItemId;

    @NotBlank
    private String reason;

    private String description;

    private String imageUrl;
}
