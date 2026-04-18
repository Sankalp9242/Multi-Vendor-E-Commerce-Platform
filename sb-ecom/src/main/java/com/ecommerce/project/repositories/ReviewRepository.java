package com.ecommerce.project.repositories;

import com.ecommerce.project.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductProductIdOrderByReviewDateDesc(Long productId);

    Optional<Review> findByProductProductIdAndUserUserId(Long productId, Long userId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.productId = :productId")
    Double getAverageRatingByProductId(Long productId);

    long countByProductProductId(Long productId);
}
