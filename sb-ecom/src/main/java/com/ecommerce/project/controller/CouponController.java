package com.ecommerce.project.controller;

import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.payload.APIResponse;
import com.ecommerce.project.payload.CartDTO;
import com.ecommerce.project.payload.CouponCodeRequest;
import com.ecommerce.project.payload.CouponDTO;
import com.ecommerce.project.payload.CouponResponse;
import com.ecommerce.project.service.CartService;
import com.ecommerce.project.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final CartService cartService;

    @GetMapping("/admin/coupons")
    public ResponseEntity<CouponResponse> getCoupons(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "couponId") String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = "desc") String sortOrder
    ) {
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        return ResponseEntity.ok(couponService.getAllCoupons(pageable));
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<CouponDTO> createCoupon(@Valid @RequestBody CouponDTO couponDTO) {
        return new ResponseEntity<>(couponService.createCoupon(couponDTO), HttpStatus.CREATED);
    }

    @PutMapping("/admin/coupons/{couponId}")
    public ResponseEntity<CouponDTO> updateCoupon(@PathVariable Long couponId,
                                                  @Valid @RequestBody CouponDTO couponDTO) {
        return ResponseEntity.ok(couponService.updateCoupon(couponId, couponDTO));
    }

    @DeleteMapping("/admin/coupons/{couponId}")
    public ResponseEntity<APIResponse> deleteCoupon(@PathVariable Long couponId) {
        couponService.deleteCoupon(couponId);
        return ResponseEntity.ok(new APIResponse("Coupon deleted successfully", true));
    }

    @PostMapping("/carts/users/cart/coupon")
    public ResponseEntity<CartDTO> applyCoupon(@Valid @RequestBody CouponCodeRequest couponCodeRequest) {
        return ResponseEntity.ok(cartService.applyCouponToLoggedInCart(couponCodeRequest.getCode()));
    }

    @DeleteMapping("/carts/users/cart/coupon")
    public ResponseEntity<CartDTO> removeCoupon() {
        return ResponseEntity.ok(cartService.removeCouponFromLoggedInCart());
    }
}
