package com.ecommerce.project.service;

import com.ecommerce.project.payload.ReviewDTO;
import com.ecommerce.project.payload.ReviewRequestDTO;

import java.util.List;

public interface ReviewService {
    List<ReviewDTO> getReviewsForProduct(Long productId);

    ReviewDTO createOrUpdateReview(Long productId, ReviewRequestDTO reviewRequestDTO);
}
