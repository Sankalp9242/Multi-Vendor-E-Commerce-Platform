package com.ecommerce.project.controller;

import com.ecommerce.project.payload.CommissionDTO;
import com.ecommerce.project.payload.SellerStatusUpdateDTO;
import com.ecommerce.project.payload.UserDTO;
import com.ecommerce.project.payload.UserResponse;
import com.ecommerce.project.service.AuthService;
import com.ecommerce.project.service.PlatformSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.project.config.AppConstants;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuthService authService;

    @Autowired
    private PlatformSettingsService platformSettingsService;

    @GetMapping("/sellers")
    public ResponseEntity<UserResponse> getAllSellers(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber) {
        Sort sortByAndOrder = Sort.by(AppConstants.SORT_USERS_BY).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, Integer.parseInt(AppConstants.PAGE_SIZE), sortByAndOrder);
        return ResponseEntity.ok(authService.getAllSellers(pageDetails));
    }

    @PutMapping("/sellers/{sellerId}/status")
    public ResponseEntity<UserDTO> updateSellerStatus(@PathVariable Long sellerId,
                                                      @Valid @RequestBody SellerStatusUpdateDTO sellerStatusUpdateDTO) {
        return ResponseEntity.ok(authService.updateSellerStatus(sellerId, sellerStatusUpdateDTO));
    }

    @GetMapping("/commission")
    public ResponseEntity<CommissionDTO> getCommission() {
        CommissionDTO dto = new CommissionDTO();
        dto.setCommissionPercentage(platformSettingsService.getCommissionPercentage());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/commission")
    public ResponseEntity<CommissionDTO> updateCommission(@Valid @RequestBody CommissionDTO commissionDTO) {
        double updatedValue = platformSettingsService.updateCommissionPercentage(commissionDTO.getCommissionPercentage());
        CommissionDTO dto = new CommissionDTO();
        dto.setCommissionPercentage(updatedValue);
        return ResponseEntity.ok(dto);
    }
}
