package com.supportpilot.controller;

import com.supportpilot.model.User;
import com.supportpilot.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getForUser(user.getId()));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal User user,
                                         @RequestBody(required = false) Map<String, String> body) {
        if (body != null && body.containsKey("id")) {
            notificationService.markRead(body.get("id"));
        } else {
            notificationService.markAllRead(user.getId());
        }
        return ResponseEntity.ok(Map.of("message", "Notifications marked as read."));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> unreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(user.getId())));
    }
}
