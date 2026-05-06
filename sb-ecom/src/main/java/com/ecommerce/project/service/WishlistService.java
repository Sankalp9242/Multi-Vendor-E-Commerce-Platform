package com.ecommerce.project.service;

import com.ecommerce.project.payload.WishlistItemDTO;

import java.util.List;

public interface WishlistService {
    List<WishlistItemDTO> getWishlist();

    WishlistItemDTO addProductToWishlist(Long productId);

    String removeProductFromWishlist(Long productId);

    boolean isProductInWishlist(Long productId);
}
