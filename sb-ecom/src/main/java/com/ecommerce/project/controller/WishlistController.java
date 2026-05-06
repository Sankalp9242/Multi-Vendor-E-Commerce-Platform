package com.ecommerce.project.controller;

import com.ecommerce.project.payload.APIResponse;
import com.ecommerce.project.payload.WishlistItemDTO;
import com.ecommerce.project.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemDTO>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist());
    }

    @PostMapping("/products/{productId}")
    public ResponseEntity<WishlistItemDTO> addProductToWishlist(@PathVariable Long productId) {
        return new ResponseEntity<>(wishlistService.addProductToWishlist(productId), HttpStatus.CREATED);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<APIResponse> removeProductFromWishlist(@PathVariable Long productId) {
        String message = wishlistService.removeProductFromWishlist(productId);
        return ResponseEntity.ok(new APIResponse(message, true));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Map<String, Boolean>> isProductInWishlist(@PathVariable Long productId) {
        return ResponseEntity.ok(Map.of("wishlisted", wishlistService.isProductInWishlist(productId)));
    }
}
