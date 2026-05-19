package com.ecommerce.project.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReturnStatusUpdateDTO {
    @NotBlank
    private String status;

    private String comment;
}
