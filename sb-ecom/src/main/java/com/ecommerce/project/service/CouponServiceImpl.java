package com.ecommerce.project.service;

import com.ecommerce.project.model.Coupon;
import com.ecommerce.project.payload.CouponDTO;
import com.ecommerce.project.payload.CouponResponse;
import com.ecommerce.project.repositories.CouponRepository;
import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final ModelMapper modelMapper;

    @Override
    public CouponDTO createCoupon(CouponDTO couponDTO) {
        String normalizedCode = normalizeCode(couponDTO.getCode());
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new APIException("Coupon code already exists");
        }

        Coupon coupon = modelMapper.map(couponDTO, Coupon.class);
        coupon.setCode(normalizedCode);
        coupon.setCouponId(null);
        return modelMapper.map(couponRepository.save(coupon), CouponDTO.class);
    }

    @Override
    public CouponDTO updateCoupon(Long couponId, CouponDTO couponDTO) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "couponId", couponId));

        String normalizedCode = normalizeCode(couponDTO.getCode());
        couponRepository.findByCodeIgnoreCase(normalizedCode)
                .filter(existingCoupon -> !existingCoupon.getCouponId().equals(couponId))
                .ifPresent(existingCoupon -> {
                    throw new APIException("Coupon code already exists");
                });

        coupon.setCode(normalizedCode);
        coupon.setDescription(couponDTO.getDescription());
        coupon.setDiscountPercentage(couponDTO.getDiscountPercentage());
        coupon.setMinimumOrderAmount(couponDTO.getMinimumOrderAmount());
        coupon.setExpiryDate(couponDTO.getExpiryDate());
        coupon.setActive(Boolean.TRUE.equals(couponDTO.getActive()));

        return modelMapper.map(couponRepository.save(coupon), CouponDTO.class);
    }

    @Override
    public void deleteCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "couponId", couponId));
        couponRepository.delete(coupon);
    }

    @Override
    public CouponResponse getAllCoupons(Pageable pageable) {
        Page<Coupon> page = couponRepository.findAll(pageable);
        return new CouponResponse(
                page.getContent().stream().map(coupon -> modelMapper.map(coupon, CouponDTO.class)).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }
}
