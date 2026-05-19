package com.ecommerce.project.controller;

import com.ecommerce.project.payload.AdminReturnReviewDTO;
import com.ecommerce.project.payload.BuyerReturnDisputeDTO;
import com.ecommerce.project.payload.CreateReturnRequestDTO;
import com.ecommerce.project.payload.ReturnDecisionDTO;
import com.ecommerce.project.payload.ReturnRequestResponseDTO;
import com.ecommerce.project.payload.ReturnStatusUpdateDTO;
import com.ecommerce.project.service.ReturnRequestService;
import com.ecommerce.project.util.AuthUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReturnRequestController {

    @Autowired
    private ReturnRequestService returnRequestService;

    @Autowired
    private AuthUtil authUtil;

    @PostMapping("/returns/create")
    public ResponseEntity<ReturnRequestResponseDTO> createReturn(@Valid @RequestBody CreateReturnRequestDTO requestDTO) {
        ReturnRequestResponseDTO response = returnRequestService.createReturn(
                authUtil.loggedInUserId(),
                requestDTO.getOrderId(),
                requestDTO.getOrderItemId(),
                requestDTO.getReason(),
                requestDTO.getDescription(),
                requestDTO.getImageUrl()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/returns/my-returns")
    public ResponseEntity<List<ReturnRequestResponseDTO>> getBuyerReturns() {
        return ResponseEntity.ok(returnRequestService.getBuyerReturns(authUtil.loggedInUserId()));
    }

    @PutMapping("/returns/{returnId}/dispute")
    public ResponseEntity<ReturnRequestResponseDTO> disputeReturn(@PathVariable Long returnId,
                                                                  @Valid @RequestBody BuyerReturnDisputeDTO disputeDTO) {
        return ResponseEntity.ok(returnRequestService.disputeReturn(returnId, authUtil.loggedInUserId(), disputeDTO.getComment()));
    }

    @GetMapping("/seller/returns")
    public ResponseEntity<List<ReturnRequestResponseDTO>> getSellerReturns() {
        return ResponseEntity.ok(returnRequestService.getSellerReturns(authUtil.loggedInUserId()));
    }

    @PutMapping("/seller/returns/{returnId}/approve")
    public ResponseEntity<ReturnRequestResponseDTO> approveReturn(@PathVariable Long returnId,
                                                                  @Valid @RequestBody ReturnDecisionDTO decisionDTO) {
        return ResponseEntity.ok(returnRequestService.approveReturn(returnId, authUtil.loggedInUserId(), decisionDTO.getComment()));
    }

    @PutMapping("/seller/returns/{returnId}/reject")
    public ResponseEntity<ReturnRequestResponseDTO> rejectReturn(@PathVariable Long returnId,
                                                                 @Valid @RequestBody ReturnDecisionDTO decisionDTO) {
        return ResponseEntity.ok(returnRequestService.rejectReturn(returnId, authUtil.loggedInUserId(), decisionDTO.getComment()));
    }

    @PutMapping("/seller/returns/{returnId}/status")
    public ResponseEntity<ReturnRequestResponseDTO> updateSellerReturnStatus(@PathVariable Long returnId,
                                                                             @Valid @RequestBody ReturnStatusUpdateDTO updateDTO) {
        return ResponseEntity.ok(
                returnRequestService.updateSellerReturnStatus(
                        returnId,
                        authUtil.loggedInUserId(),
                        updateDTO.getStatus(),
                        updateDTO.getComment()
                )
        );
    }

    @GetMapping("/admin/returns")
    public ResponseEntity<List<ReturnRequestResponseDTO>> getAdminReturnReviews() {
        return ResponseEntity.ok(returnRequestService.getAdminReviewReturns());
    }

    @PutMapping("/admin/returns/{returnId}/review")
    public ResponseEntity<ReturnRequestResponseDTO> adminReviewReturn(@PathVariable Long returnId,
                                                                      @Valid @RequestBody AdminReturnReviewDTO reviewDTO) {
        return ResponseEntity.ok(
                returnRequestService.adminReview(
                        returnId,
                        Boolean.TRUE.equals(reviewDTO.getApprove()),
                        reviewDTO.getComment()
                )
        );
    }

    @PutMapping("/admin/returns/{returnId}/process-refund")
    public ResponseEntity<ReturnRequestResponseDTO> processRefund(@PathVariable Long returnId,
                                                                  @Valid @RequestBody ReturnDecisionDTO decisionDTO) {
        return ResponseEntity.ok(returnRequestService.processRefund(returnId, decisionDTO.getComment()));
    }

    @PutMapping("/admin/returns/{returnId}/close")
    public ResponseEntity<ReturnRequestResponseDTO> closeReturn(@PathVariable Long returnId,
                                                                @Valid @RequestBody ReturnDecisionDTO decisionDTO) {
        return ResponseEntity.ok(returnRequestService.closeReturn(returnId, decisionDTO.getComment()));
    }
}
