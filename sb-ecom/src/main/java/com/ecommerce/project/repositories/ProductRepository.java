package com.ecommerce.project.repositories;

import com.ecommerce.project.model.Category;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ProductStatus;
import com.ecommerce.project.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findByCategoryAndDeletedFalseOrderByPriceAsc(Category category, Pageable pageDetails);

    Page<Product> findByProductNameLikeIgnoreCaseAndDeletedFalse(String keyword, Pageable pageDetails);

    Page<Product> findByUserAndDeletedFalse(User user, Pageable pageDetails);

    Page<Product> findByUserAndProductStatusAndDeletedFalse(User user, ProductStatus productStatus, Pageable pageable);

    long countByProductStatusAndDeletedFalse(ProductStatus productStatus);

    java.util.List<Product> findTop5ByProductStatusAndDeletedFalseOrderByProductIdAsc(ProductStatus productStatus);

    long countByUserUserIdAndDeletedFalse(Long userId);

    long countByUserUserIdAndProductStatusAndDeletedFalse(Long userId, ProductStatus productStatus);

    long countByDeletedFalse();

    Page<Product> findByDeletedFalse(Pageable pageable);
}
