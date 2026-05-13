package com.ecommerce.project.service;

import com.ecommerce.project.payload.CouponDTO;
import com.ecommerce.project.payload.CouponResponse;
import org.springframework.data.domain.Pageable;

public interface CouponService {
    CouponDTO createCoupon(CouponDTO couponDTO);

    CouponDTO updateCoupon(Long couponId, CouponDTO couponDTO);

    void deleteCoupon(Long couponId);

    CouponResponse getAllCoupons(Pageable pageable);
}
