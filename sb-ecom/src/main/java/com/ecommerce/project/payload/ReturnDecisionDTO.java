package com.ecommerce.project.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReturnDecisionDTO {
    @NotBlank
    private String comment;
}
