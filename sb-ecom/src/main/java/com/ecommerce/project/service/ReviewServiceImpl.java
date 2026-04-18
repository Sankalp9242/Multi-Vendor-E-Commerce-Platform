package com.ecommerce.project.service;

import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResourceNotFoundException;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.Review;
import com.ecommerce.project.model.User;
import com.ecommerce.project.payload.ReviewDTO;
import com.ecommerce.project.payload.ReviewRequestDTO;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.repositories.ReviewRepository;
import com.ecommerce.project.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AuthUtil authUtil;

    @Override
    public List<ReviewDTO> getReviewsForProduct(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        return reviewRepository.findByProductProductIdOrderByReviewDateDesc(productId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public ReviewDTO createOrUpdateReview(Long productId, ReviewRequestDTO reviewRequestDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        User user = authUtil.loggedInUser();

        if (product.getUser() != null && product.getUser().getUserId().equals(user.getUserId())) {
            throw new APIException("You cannot review your own product");
        }

        if (!orderRepository.existsReviewEligibleOrder(authUtil.loggedInEmail(), productId)) {
            throw new APIException("You can review only products you have purchased");
        }

        Review review = reviewRepository.findByProductProductIdAndUserUserId(productId, user.getUserId())
                .orElseGet(Review::new);

        review.setProduct(product);
        review.setUser(user);
        review.setRating(reviewRequestDTO.getRating());
        review.setComment(reviewRequestDTO.getComment().trim());
        review.setReviewDate(LocalDate.now());

        return mapToDto(reviewRepository.save(review));
    }

    private ReviewDTO mapToDto(Review review) {
        return new ReviewDTO(
                review.getReviewId(),
                review.getProduct().getProductId(),
                review.getRating(),
                review.getComment(),
                review.getReviewDate(),
                review.getUser().getUserName()
        );
    }
}
