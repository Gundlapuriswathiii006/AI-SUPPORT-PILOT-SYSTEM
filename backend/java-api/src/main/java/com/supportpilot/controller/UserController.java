package com.supportpilot.controller;

import com.supportpilot.dto.request.RegisterRequest;
import com.supportpilot.dto.request.UpdateUserRequest;
import com.supportpilot.model.User;
import com.supportpilot.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.createUser(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable String id,
                                        @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(authService.updateUser(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        authService.deleteUser(id);
        return ResponseEntity.ok(java.util.Map.of("message", "User deleted.", "id", id));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String id) {
        return ResponseEntity.ok(authService.toggleUserStatus(id));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable String id,
                                           @RequestBody UpdateUserRequest req,
                                           @AuthenticationPrincipal User currentUser) {
        // Users can only update their own profile; admins can update anyone
        if (!currentUser.getId().equals(id) && !"admin".equals(currentUser.getRole())) {
            return ResponseEntity.status(403)
                    .body(java.util.Map.of("message", "Forbidden."));
        }
        return ResponseEntity.ok(authService.updateProfile(id, req));
    }
}
