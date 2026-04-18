package com.ecommerce.project.service;

import com.ecommerce.project.payload.AnalyticsResponse;

public interface AnalyticsService {
    AnalyticsResponse getAnalyticsData();

    AnalyticsResponse getSellerAnalyticsData(Long sellerId);
}
