package com.ecommerce.project.payload;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequestDTO {
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    @Size(min = 5, max = 500)
    private String comment;
}
