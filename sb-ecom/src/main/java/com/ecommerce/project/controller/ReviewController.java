package com.ecommerce.project.controller;

import com.ecommerce.project.payload.ReviewDTO;
import com.ecommerce.project.payload.ReviewEligibilityDTO;
import com.ecommerce.project.payload.ReviewRequestDTO;
import com.ecommerce.project.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/public/products/{productId}/reviews")
    public ResponseEntity<List<ReviewDTO>> getReviewsForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsForProduct(productId));
    }

    @GetMapping("/products/{productId}/reviews/eligibility")
    public ResponseEntity<ReviewEligibilityDTO> getReviewEligibility(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewEligibility(productId));
    }

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ReviewDTO> createOrUpdateReview(@PathVariable Long productId,
                                                          @Valid @RequestBody ReviewRequestDTO reviewRequestDTO) {
        ReviewDTO reviewDTO = reviewService.createOrUpdateReview(productId, reviewRequestDTO);
        return new ResponseEntity<>(reviewDTO, HttpStatus.CREATED);
    }
}
