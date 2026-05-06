package com.ecommerce.project.repositories;

import com.ecommerce.project.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserUserIdOrderByAddedAtDesc(Long userId);

    Optional<WishlistItem> findByProductProductIdAndUserUserId(Long productId, Long userId);

    boolean existsByProductProductIdAndUserUserId(Long productId, Long userId);

    void deleteByProductProductIdAndUserUserId(Long productId, Long userId);
}
