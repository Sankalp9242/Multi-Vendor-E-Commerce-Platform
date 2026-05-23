package com.ecommerce.project.repositories;

import com.ecommerce.project.model.ReturnRequest;
import com.ecommerce.project.model.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    @Query("""
        SELECT rr FROM ReturnRequest rr
        JOIN FETCH rr.order o
        JOIN FETCH rr.orderItem oi
        JOIN FETCH oi.product p
        JOIN FETCH rr.buyer
        JOIN FETCH rr.seller
        WHERE rr.buyer.userId = :buyerId
        ORDER BY rr.createdAt DESC""")
    List<ReturnRequest> findAllByBuyerId(@Param("buyerId") Long buyerId);

    @Query("""
        SELECT rr FROM ReturnRequest rr
        JOIN FETCH rr.order o
        JOIN FETCH rr.orderItem oi
        JOIN FETCH oi.product p
        JOIN FETCH rr.buyer
        JOIN FETCH rr.seller
        WHERE rr.seller.userId = :sellerId
        ORDER BY rr.createdAt DESC""")
    List<ReturnRequest> findAllBySellerId(@Param("sellerId") Long sellerId);

    @Query("""
        SELECT rr FROM ReturnRequest rr
        JOIN FETCH rr.order o
        JOIN FETCH rr.orderItem oi
        JOIN FETCH oi.product p
        JOIN FETCH rr.buyer
        JOIN FETCH rr.seller
        WHERE rr.status IN ('UNDER_REVIEW', 'PRODUCT_RECEIVED', 'REFUND_PROCESSED')
        ORDER BY rr.updatedAt DESC""")
    List<ReturnRequest> findAllUnderReview();

    @Query("""
        SELECT rr FROM ReturnRequest rr
        JOIN FETCH rr.order o
        JOIN FETCH rr.orderItem oi
        JOIN FETCH oi.product p
        JOIN FETCH rr.buyer
        JOIN FETCH rr.seller
        ORDER BY rr.updatedAt DESC, rr.createdAt DESC""")
    List<ReturnRequest> findAllWithDetailsOrderByUpdatedAtDesc();

    boolean existsByOrderItemOrderItemId(Long orderItemId);

    boolean existsByOrderItemOrderItemIdAndStatusIn(Long orderItemId, Collection<ReturnStatus> statuses);

    @Query("""
        SELECT CASE WHEN COUNT(rr) > 0 THEN true ELSE false END
        FROM ReturnRequest rr
        WHERE rr.orderItem.orderItemId = :orderItemId
        AND rr.status IN :statuses""")
    boolean existsRefundedReturnForOrderItem(@Param("orderItemId") Long orderItemId,
                                             @Param("statuses") Collection<ReturnStatus> statuses);
}
