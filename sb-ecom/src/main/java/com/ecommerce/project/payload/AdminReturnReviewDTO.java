package com.ecommerce.project.payload;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminReturnReviewDTO {
    @NotNull
    private Boolean approve;

    private String comment;
}
