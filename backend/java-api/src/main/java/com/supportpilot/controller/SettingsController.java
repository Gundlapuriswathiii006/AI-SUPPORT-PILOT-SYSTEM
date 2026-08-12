package com.supportpilot.controller;

import com.supportpilot.dto.request.SettingsRequest;
import com.supportpilot.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(settingsService.get());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSettings(@RequestBody SettingsRequest req) {
        return ResponseEntity.ok(settingsService.update(req));
    }
}
