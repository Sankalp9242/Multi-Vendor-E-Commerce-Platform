package com.ecommerce.project.controller;

import com.ecommerce.project.payload.SellerProfileUpdateDTO;
import com.ecommerce.project.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seller/profile")
public class SellerProfileController {

    @Autowired
    private AuthService authService;

    @PutMapping
    public ResponseEntity<?> updateSellerProfile(@Valid @RequestBody SellerProfileUpdateDTO sellerProfileUpdateDTO) {
        return ResponseEntity.ok(authService.updateSellerProfile(sellerProfileUpdateDTO));
    }
}
