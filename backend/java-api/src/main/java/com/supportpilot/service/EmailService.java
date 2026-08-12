package com.supportpilot.service;

import com.supportpilot.exception.EmailSendException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${supportpilot.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${supportpilot.mail.from:}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    /**
     * Send an email notification via SMTP when mail is enabled, otherwise log only.
     */
    public Map<String, Object> sendNotification(
            String email,
            String subject,
            String message,
            String ticketId,
            String type) {

        if (!mailEnabled) {
            throw new EmailSendException(
                    "Email delivery is disabled. Set MAIL_ENABLED=true and configure SMTP settings in .env.");
        }

        String sender = resolveFromAddress();
        if (!StringUtils.hasText(sender)) {
            throw new EmailSendException(
                    "Sender address is not configured. Set SMTP_FROM (or SMTP_USERNAME) in .env.");
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(sender);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(buildBody(message, ticketId, type), false);
            mailSender.send(mimeMessage);

            log.info("Email sent to {} | subject: {} | ticketId: {} | type: {}",
                    email, subject, ticketId, type);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("status", "sent");
            result.put("mode", "provider");
            result.put("message", "Email delivered successfully.");
            result.put("recipient", email);
            return result;
        } catch (MessagingException | MailException ex) {
            log.error("Failed to send email to {}: {}", email, ex.getMessage());
            throw new EmailSendException("Failed to send email. Check SMTP credentials and try again.", ex);
        }
    }

    private String resolveFromAddress() {
        if (StringUtils.hasText(fromAddress)) {
            return fromAddress;
        }
        return smtpUsername;
    }

    private String buildBody(String message, String ticketId, String type) {
        StringBuilder body = new StringBuilder(message.trim());
        if (StringUtils.hasText(ticketId)) {
            body.append("\n\n---\nTicket reference: #").append(ticketId);
        }
        if (StringUtils.hasText(type)) {
            body.append("\nMessage type: ").append(type);
        }
        return body.toString();
    }
}
