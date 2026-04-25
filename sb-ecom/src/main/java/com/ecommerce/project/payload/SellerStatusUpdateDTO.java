package com.ecommerce.project.payload;

import lombok.Data;

@Data
public class SellerStatusUpdateDTO {
    private Boolean sellerApproved;
    private Boolean sellerActive;
}
