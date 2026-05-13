package com.ecommerce.project.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Locale;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long couponId;

    private String code;
    private String description;
    private Double discountPercentage;
    private Double minimumOrderAmount;
    private LocalDate expiryDate;
    private Boolean active = true;

    @PrePersist
    @PreUpdate
    void normalize() {
        if (code != null) {
            code = code.trim().toUpperCase(Locale.ROOT);
        }

        if (active == null) {
            active = true;
        }
    }
}
