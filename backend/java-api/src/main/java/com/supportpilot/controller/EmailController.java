package com.supportpilot.controller;

import com.supportpilot.dto.request.EmailNotifyRequest;
import com.supportpilot.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @Value("${supportpilot.email-api-key:}")
    private String emailApiKey;

    @PostMapping("/notify")
    public ResponseEntity<?> sendNotification(
            @RequestHeader(value = "X-Email-Api-Key", required = false) String apiKey,
            @Valid @RequestBody EmailNotifyRequest req,
            Authentication authentication) {

        if (StringUtils.hasText(emailApiKey) && !isAuthorized(apiKey, authentication)) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid or missing email API key."));
        }

        return ResponseEntity.ok(emailService.sendNotification(
                req.getEmail(),
                req.getSubject(),
                req.getMessage(),
                req.getTicketId(),
                req.getType()));
    }

    private boolean isAuthorized(String apiKey, Authentication authentication) {
        if (emailApiKey.equals(apiKey)) {
            return true;
        }
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }
}
