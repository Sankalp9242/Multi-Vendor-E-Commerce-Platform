package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ecommerce.project.model.ProductStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long productId;
    private String productName;
    private String image;
    private String description;
    private Integer quantity;
    private double price;
    private double discount;
    private double specialPrice;
    private Double averageRating;
    private Long reviewCount;
    private Long sellerId;
    private String sellerName;
    private ProductStatus productStatus;
}
