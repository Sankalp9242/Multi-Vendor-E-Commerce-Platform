package com.ecommerce.project.service;

import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResourceNotFoundException;
import com.ecommerce.project.model.AppRole;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.Review;
import com.ecommerce.project.model.Role;
import com.ecommerce.project.model.User;
import com.ecommerce.project.payload.ReviewDTO;
import com.ecommerce.project.payload.ReviewEligibilityDTO;
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
    public ReviewEligibilityDTO getReviewEligibility(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        User user = authUtil.loggedInUser();

        if (!isBuyerReviewAllowed(user)) {
            return new ReviewEligibilityDTO(
                    false,
                    false,
                    "Only buyers with a customer account can add reviews"
            );
        }

        if (product.getUser() != null && product.getUser().getUserId().equals(user.getUserId())) {
            return new ReviewEligibilityDTO(false, false, "You cannot review your own product");
        }

        boolean alreadyReviewed = reviewRepository
                .findByProductProductIdAndUserUserId(productId, user.getUserId())
                .isPresent();

        if (!orderRepository.existsReviewEligibleOrder(authUtil.loggedInEmail(), productId)) {
            return new ReviewEligibilityDTO(
                    false,
                    alreadyReviewed,
                    "You can review only products you have successfully purchased"
            );
        }

        return new ReviewEligibilityDTO(
                true,
                alreadyReviewed,
                alreadyReviewed ? "You can update your review for this purchased product" : "You can review this purchased product"
        );
    }

    @Override
    public ReviewDTO createOrUpdateReview(Long productId, ReviewRequestDTO reviewRequestDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        User user = authUtil.loggedInUser();

        if (!isBuyerReviewAllowed(user)) {
            throw new APIException("Only buyers with a customer account can add reviews");
        }

        if (product.getUser() != null && product.getUser().getUserId().equals(user.getUserId())) {
            throw new APIException("You cannot review your own product");
        }

        if (!orderRepository.existsReviewEligibleOrder(authUtil.loggedInEmail(), productId)) {
            throw new APIException("You can review only products you have successfully purchased");
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

    private boolean isBuyerReviewAllowed(User user) {
        boolean hasCustomerRole = user.getRoles().stream()
                .map(Role::getRoleName)
                .anyMatch(roleName -> roleName == AppRole.ROLE_USER);
        boolean hasRestrictedRole = user.getRoles().stream()
                .map(Role::getRoleName)
                .anyMatch(roleName -> roleName == AppRole.ROLE_ADMIN || roleName == AppRole.ROLE_SELLER);

        return hasCustomerRole && !hasRestrictedRole;
    }
}
