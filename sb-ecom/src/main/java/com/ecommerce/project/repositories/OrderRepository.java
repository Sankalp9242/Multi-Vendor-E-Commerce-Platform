package com.ecommerce.project.repositories;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.project.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    Double getTotalRevenue();
    Page<Order> findByEmail(String email, Pageable pageable);

    java.util.List<Order> findTop5ByOrderByOrderDateDesc();

    @Query("""
        SELECT COUNT(DISTINCT o.orderId) FROM Order o
        JOIN o.orderItems oi
        WHERE oi.product.user.userId = :sellerId""")
    long countOrdersBySeller(@Param("sellerId") Long sellerId);

    @Query("""
        SELECT COALESCE(SUM(oi.quantity * oi.orderedProductPrice), 0) FROM Order o
        JOIN o.orderItems oi
        WHERE oi.product.user.userId = :sellerId""")
    Double getRevenueBySeller(@Param("sellerId") Long sellerId);

    @Query("""
        SELECT COUNT(DISTINCT o.orderId) FROM Order o
        JOIN o.orderItems oi
        WHERE oi.product.user.userId = :sellerId
        AND UPPER(o.orderStatus) = :status""")
    long countOrdersBySellerAndStatus(@Param("sellerId") Long sellerId, @Param("status") String status);

    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0) FROM Order o
        JOIN o.orderItems oi
        WHERE oi.product.user.userId = :sellerId""")
    Long getSoldUnitsBySeller(@Param("sellerId") Long sellerId);

    @Query("""
        SELECT DISTINCT o FROM Order o
        JOIN o.orderItems oi
        WHERE oi.product.user.userId = :sellerId""")
    Page<Order> findOrdersBySeller(@Param("sellerId") Long sellerId, Pageable pageable);

    @Query("""
        SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o
        JOIN o.orderItems oi
        WHERE o.orderId = :orderId AND oi.product.user.userId = :sellerId""")
    boolean existsOrderForSeller(@Param("orderId") Long orderId, @Param("sellerId") Long sellerId);

    @Query("""
        SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o
        JOIN o.orderItems oi
        WHERE o.email = :email
        AND oi.product.productId = :productId
        AND UPPER(o.orderStatus) IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')""")
    boolean existsReviewEligibleOrder(@Param("email") String email, @Param("productId") Long productId);

}
