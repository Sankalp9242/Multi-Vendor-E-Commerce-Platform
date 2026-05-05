package com.ecommerce.project.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerStatusReportDTO {
    private Long approvedActive;
    private Long approvedInactive;
    private Long pendingApproval;
}
