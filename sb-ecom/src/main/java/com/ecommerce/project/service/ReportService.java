package com.ecommerce.project.service;

import com.ecommerce.project.payload.AdminReportsResponse;
import com.ecommerce.project.payload.SellerReportsResponse;
import com.ecommerce.project.payload.UserReportsResponse;

public interface ReportService {
    UserReportsResponse getUserReports(String email);

    SellerReportsResponse getSellerReports(Long sellerId);

    AdminReportsResponse getAdminReports();
}
