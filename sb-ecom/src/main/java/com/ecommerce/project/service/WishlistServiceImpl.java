package com.ecommerce.project.service;

import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResourceNotFoundException;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ProductStatus;
import com.ecommerce.project.model.User;
import com.ecommerce.project.model.WishlistItem;
import com.ecommerce.project.payload.ProductDTO;
import com.ecommerce.project.payload.WishlistItemDTO;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.repositories.ReviewRepository;
import com.ecommerce.project.repositories.WishlistItemRepository;
import com.ecommerce.project.util.AuthUtil;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private ModelMapper modelMapper;

    @Value("${image.base.url}")
    private String imageBaseUrl;

    @Override
    public List<WishlistItemDTO> getWishlist() {
        Long userId = authUtil.loggedInUserId();
        return wishlistItemRepository.findByUserUserIdOrderByAddedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public WishlistItemDTO addProductToWishlist(Long productId) {
        User user = authUtil.loggedInUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        validateWishlistProduct(product, user);

        WishlistItem wishlistItem = wishlistItemRepository
                .findByProductProductIdAndUserUserId(productId, user.getUserId())
                .orElseGet(() -> {
                    WishlistItem item = new WishlistItem();
                    item.setProduct(product);
                    item.setUser(user);
                    return item;
                });

        return mapToDto(wishlistItemRepository.save(wishlistItem));
    }

    @Override
    @Transactional
    public String removeProductFromWishlist(Long productId) {
        Long userId = authUtil.loggedInUserId();
        if (!wishlistItemRepository.existsByProductProductIdAndUserUserId(productId, userId)) {
            throw new ResourceNotFoundException("Wishlist item", "productId", productId);
        }

        wishlistItemRepository.deleteByProductProductIdAndUserUserId(productId, userId);
        return "Product removed from wishlist";
    }

    @Override
    public boolean isProductInWishlist(Long productId) {
        return wishlistItemRepository.existsByProductProductIdAndUserUserId(productId, authUtil.loggedInUserId());
    }

    private void validateWishlistProduct(Product product, User user) {
        if (Boolean.TRUE.equals(product.getDeleted()) || product.getProductStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException("Product", "productId", product.getProductId());
        }

        if (product.getUser() != null && product.getUser().getUserId().equals(user.getUserId())) {
            throw new APIException("You cannot add your own product to wishlist");
        }
    }

    private WishlistItemDTO mapToDto(WishlistItem wishlistItem) {
        Product product = wishlistItem.getProduct();
        WishlistItemDTO dto = new WishlistItemDTO();
        dto.setWishlistItemId(wishlistItem.getWishlistItemId());
        dto.setProductId(product.getProductId());
        dto.setAddedAt(wishlistItem.getAddedAt());
        dto.setProduct(mapProductToDto(product));
        return dto;
    }

    private ProductDTO mapProductToDto(Product product) {
        ProductDTO productDTO = modelMapper.map(product, ProductDTO.class);
        productDTO.setImage(constructImageUrl(product.getImage()));
        productDTO.setAverageRating(reviewRepository.getAverageRatingByProductId(product.getProductId()));
        productDTO.setReviewCount(reviewRepository.countByProductProductId(product.getProductId()));
        if (product.getUser() != null) {
            productDTO.setSellerId(product.getUser().getUserId());
            productDTO.setSellerName(product.getUser().getStoreName() != null
                    ? product.getUser().getStoreName()
                    : product.getUser().getUserName());
        }
        return productDTO;
    }

    private String constructImageUrl(String imageName) {
        if (imageName == null || imageName.isBlank()) {
            return imageName;
        }

        if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
            return imageName;
        }

        return imageBaseUrl.endsWith("/") ? imageBaseUrl + imageName : imageBaseUrl + "/" + imageName;
    }
}
