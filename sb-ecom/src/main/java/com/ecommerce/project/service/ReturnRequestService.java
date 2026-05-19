package com.ecommerce.project.service;

import com.ecommerce.project.payload.ReturnRequestResponseDTO;

import java.util.List;

public interface ReturnRequestService {
    ReturnRequestResponseDTO createReturn(Long buyerId, Long orderId, Long orderItemId, String reason, String description, String imageUrl);

    List<ReturnRequestResponseDTO> getBuyerReturns(Long buyerId);

    List<ReturnRequestResponseDTO> getSellerReturns(Long sellerId);

    List<ReturnRequestResponseDTO> getAdminReviewReturns();

    ReturnRequestResponseDTO approveReturn(Long returnRequestId, Long sellerId, String comment);

    ReturnRequestResponseDTO rejectReturn(Long returnRequestId, Long sellerId, String comment);

    ReturnRequestResponseDTO updateSellerReturnStatus(Long returnRequestId, Long sellerId, String nextStatus, String comment);

    ReturnRequestResponseDTO disputeReturn(Long returnRequestId, Long buyerId, String comment);

    ReturnRequestResponseDTO adminReview(Long returnRequestId, boolean approve, String comment);
}
