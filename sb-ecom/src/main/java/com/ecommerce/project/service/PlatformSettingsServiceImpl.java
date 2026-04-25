package com.ecommerce.project.service;

import com.ecommerce.project.model.PlatformSettings;
import com.ecommerce.project.repositories.PlatformSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlatformSettingsServiceImpl implements PlatformSettingsService {

    private static final long SETTINGS_ID = 1L;

    @Autowired
    private PlatformSettingsRepository platformSettingsRepository;

    @Override
    public double getCommissionPercentage() {
        return getOrCreate().getCommissionPercentage();
    }

    @Override
    public double updateCommissionPercentage(double commissionPercentage) {
        PlatformSettings settings = getOrCreate();
        settings.setCommissionPercentage(commissionPercentage);
        return platformSettingsRepository.save(settings).getCommissionPercentage();
    }

    private PlatformSettings getOrCreate() {
        return platformSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> platformSettingsRepository.save(new PlatformSettings(SETTINGS_ID, 10.0)));
    }
}
