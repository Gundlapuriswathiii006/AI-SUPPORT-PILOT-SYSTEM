package com.supportpilot.service;

import com.supportpilot.config.JwtUtil;
import com.supportpilot.dto.request.LoginRequest;
import com.supportpilot.dto.request.RegisterRequest;
import com.supportpilot.dto.request.UpdateUserRequest;
import com.supportpilot.dto.response.AuthResponse;
import com.supportpilot.dto.response.UserResponse;
import com.supportpilot.model.User;
import com.supportpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered. Please sign in instead.");
        }

        // Public registration: only employee or support
        String role = req.getRole() != null ? req.getRole().toLowerCase() : "employee";
        if (!List.of("employee", "support").contains(role)) {
            role = "employee";
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder().user(UserResponse.from(user)).token(token).build();
    }

    @Transactional
    public AuthResponse registerAdmin(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .role("admin")
                .build();
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder().user(UserResponse.from(user)).token(token).build();
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (user.isDisabled()) {
            throw new RuntimeException("This account has been disabled.");
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder().user(UserResponse.from(user)).token(token).build();
    }

    public UserResponse getCurrentUser(User user) {
        return UserResponse.from(user);
    }

    public Object forgotPassword(String email) {
        // In production: send reset email. For now acknowledge silently.
        log.info("Password reset requested for: {}", email);
        return java.util.Map.of("message", "If that email exists, a reset link has been sent.");
    }

    // ── Admin: User Management ─────────────────────────────────────────────────

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }
        String role = req.getRole() != null ? req.getRole().toLowerCase() : "employee";
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(
                        req.getPassword() != null ? req.getPassword() : "changeme123"))
                .role(role)
                .build();
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(String userId, UpdateUserRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (req.getName() != null) user.setName(req.getName());
        if (req.getEmail() != null) {
            String newEmail = req.getEmail().toLowerCase();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new RuntimeException("Email already in use.");
            }
            user.setEmail(newEmail);
        }
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        if (req.getRole() != null) user.setRole(req.getRole().toLowerCase());
        if (req.getDisabled() != null) user.setDisabled(req.getDisabled());

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found.");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public UserResponse toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));
        user.setDisabled(!user.isDisabled());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateProfile(String userId, UpdateUserRequest req) {
        return updateUser(userId, req);
    }
}
