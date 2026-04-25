package com.ecommerce.project.service;

public interface PlatformSettingsService {
    double getCommissionPercentage();

    double updateCommissionPercentage(double commissionPercentage);
}
