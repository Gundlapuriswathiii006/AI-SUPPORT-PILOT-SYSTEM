package com.supportpilot.config;

import com.supportpilot.model.KbArticle;
import com.supportpilot.model.SystemSettings;
import com.supportpilot.model.User;
import com.supportpilot.repository.KbArticleRepository;
import com.supportpilot.repository.SystemSettingsRepository;
import com.supportpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final KbArticleRepository kbArticleRepository;
    private final SystemSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSettings();
        seedDefaultAdmin();
        seedKbArticles();
    }

    private void seedSettings() {
        if (!settingsRepository.existsById(1L)) {
            settingsRepository.save(SystemSettings.builder()
                    .id(1L)
                    .siteName("AI-SupportPilot")
                    .supportEmail("support@ai-supportpilot.ai")
                    .autoAssignTickets(true)
                    .aiClassificationEnabled(true)
                    .build());
            log.info("✅ Default system settings created.");
        }
    }

    /**
     * DEMO ACCOUNTS — TESTING CONVENIENCE ONLY.
     *
     * All three seeded accounts share ONE password (DEFAULT_DEMO_PASSWORD) so that
     * anyone testing the app only has to remember a single password and just pick
     * the email address matching the role they want to try.
     *
     * This is intentionally NOT how real user accounts should work — a shared
     * password removes per-user accountability. Before this goes anywhere near
     * production data, either delete these seeded rows or force a password reset
     * on first login. The password can be overridden via the DEMO_PASSWORD env var.
     */
    private static final String DEFAULT_DEMO_PASSWORD = "SupportPilot@2025";

    private void seedDefaultAdmin() {
        String demoPassword = System.getenv().getOrDefault("DEMO_PASSWORD", DEFAULT_DEMO_PASSWORD);

        if (!userRepository.existsByEmail("admin@supportpilot.ai")) {
            userRepository.save(User.builder()
                    .name("Admin User")
                    .email("admin@supportpilot.ai")
                    .password(passwordEncoder.encode(demoPassword))
                    .role("admin")
                    .build());
            log.info("✅ Default admin seeded → admin@supportpilot.ai / {}", demoPassword);
        }
        if (!userRepository.existsByEmail("support@supportpilot.ai")) {
            userRepository.save(User.builder()
                    .name("Support Agent")
                    .email("support@supportpilot.ai")
                    .password(passwordEncoder.encode(demoPassword))
                    .role("support")
                    .build());
            log.info("✅ Default support agent seeded → support@supportpilot.ai / {}", demoPassword);
        }
        if (!userRepository.existsByEmail("employee@supportpilot.ai")) {
            userRepository.save(User.builder()
                    .name("John Employee")
                    .email("employee@supportpilot.ai")
                    .password(passwordEncoder.encode(demoPassword))
                    .role("employee")
                    .build());
            log.info("✅ Default employee seeded → employee@supportpilot.ai / {}", demoPassword);
        }
        log.info("ℹ️  All demo accounts share one password ({}). See DataSeeder.java for details.", demoPassword);
    }

    private void seedKbArticles() {
        if (kbArticleRepository.count() == 0) {
            kbArticleRepository.save(KbArticle.builder()
                    .title("How to Reset Your Password")
                    .category("IT Support")
                    .content("To reset your password: 1. Go to the login page. 2. Click 'Forgot Password'. " +
                            "3. Enter your email address. 4. Check your email for the reset link. " +
                            "5. Click the link and enter a new password. If you don't receive the email, " +
                            "check your spam folder or contact IT support.")
                    .build());

            kbArticleRepository.save(KbArticle.builder()
                    .title("VPN Setup and Troubleshooting Guide")
                    .category("IT Support")
                    .content("VPN Setup: 1. Download the VPN client from the company portal. " +
                            "2. Install and run the application. 3. Enter your company credentials. " +
                            "4. Select the nearest server. Troubleshooting: If you cannot connect, " +
                            "check your internet connection, firewall settings, or contact IT support.")
                    .build());

            kbArticleRepository.save(KbArticle.builder()
                    .title("How to Request Laptop or Equipment Repairs")
                    .category("Facilities")
                    .content("To request equipment repair: 1. Submit a ticket under the Facilities category. " +
                            "2. Include the device model and serial number. 3. Describe the issue clearly. " +
                            "4. Our team will contact you within 24 hours to arrange pickup or on-site repair.")
                    .build());

            kbArticleRepository.save(KbArticle.builder()
                    .title("Expense Reimbursement Policy")
                    .category("Finance")
                    .content("Expense reimbursement policy: 1. Submit receipts within 30 days. " +
                            "2. Use the expense submission portal. 3. Expenses over $500 require manager approval. " +
                            "4. Reimbursements are processed within 5–7 business days. " +
                            "Contact HR for questions about eligible expenses.")
                    .build());

            kbArticleRepository.save(KbArticle.builder()
                    .title("Leave and Holiday Request Process")
                    .category("HR")
                    .content("To request leave: 1. Log into the HR portal. 2. Navigate to 'Leave Requests'. " +
                            "3. Select dates and leave type. 4. Submit for manager approval. " +
                            "Annual leave must be requested at least 2 weeks in advance. " +
                            "Emergency leave can be requested same-day with manager notification.")
                    .build());

            kbArticleRepository.save(KbArticle.builder()
                    .title("Software Installation Request Guide")
                    .category("IT Support")
                    .content("To request software installation: 1. Verify the software is on the approved list. " +
                            "2. Submit a ticket with the software name and business justification. " +
                            "3. For licensed software, include the license key if provided by the vendor. " +
                            "4. IT will install it within 1–2 business days. " +
                            "Unlicensed or personal software cannot be installed on company devices.")
                    .build());

            kbArticleRepository.save(KbArticle.builder()
                    .title("Network and Internet Connectivity Issues")
                    .category("IT Support")
                    .content("Basic network troubleshooting: 1. Restart your device. " +
                            "2. Unplug and replug the ethernet cable or reconnect to Wi-Fi. " +
                            "3. Check if the issue is isolated to your machine or affects the whole office. " +
                            "4. Run 'ping google.com' in command prompt to test connectivity. " +
                            "If all else fails, submit an IT ticket with the error details.")
                    .build());

            kbArticleRepository.save(KbArticle.builder()
                    .title("Onboarding Checklist for New Employees")
                    .category("HR")
                    .content("New employee checklist: 1. Complete HR onboarding forms. " +
                            "2. Collect your laptop and access badge from IT/Facilities. " +
                            "3. Set up your email and company accounts. " +
                            "4. Complete mandatory training modules. " +
                            "5. Meet your team and manager for orientation. " +
                            "Contact HR at hr@company.com for any onboarding questions.")
                    .build());

            log.info("✅ Seeded {} KB articles.", kbArticleRepository.count());
        }
    }
}
