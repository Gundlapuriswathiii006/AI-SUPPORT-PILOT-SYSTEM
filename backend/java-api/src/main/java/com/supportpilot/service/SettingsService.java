package com.supportpilot.service;

import com.supportpilot.dto.request.SettingsRequest;
import com.supportpilot.model.SystemSettings;
import com.supportpilot.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SystemSettingsRepository settingsRepository;

    public SystemSettings get() {
        return settingsRepository.findById(1L).orElseGet(() -> {
            SystemSettings defaults = SystemSettings.builder()
                    .id(1L)
                    .siteName("SupportPilot")
                    .supportEmail("support@supportpilot.ai")
                    .autoAssignTickets(true)
                    .aiClassificationEnabled(true)
                    .build();
            return settingsRepository.save(defaults);
        });
    }

    @Transactional
    public SystemSettings update(SettingsRequest req) {
        SystemSettings settings = get();
        if (req.getSiteName() != null) settings.setSiteName(req.getSiteName());
        if (req.getSupportEmail() != null) settings.setSupportEmail(req.getSupportEmail());
        if (req.getAutoAssignTickets() != null) settings.setAutoAssignTickets(req.getAutoAssignTickets());
        if (req.getAiClassificationEnabled() != null) settings.setAiClassificationEnabled(req.getAiClassificationEnabled());
        return settingsRepository.save(settings);
    }
}
