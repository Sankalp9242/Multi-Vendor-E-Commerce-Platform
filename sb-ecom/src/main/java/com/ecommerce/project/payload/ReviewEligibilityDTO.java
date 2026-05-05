package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEligibilityDTO {
    private boolean canReview;
    private boolean alreadyReviewed;
    private String message;
}
