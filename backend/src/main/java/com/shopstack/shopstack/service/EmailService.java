package com.shopstack.shopstack.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            System.out.println("===================================================================");
            System.out.println("WARNING: SPRING_MAIL_USERNAME is not configured in .env file.");
            System.out.println("Could not send real email to " + toEmail);
            System.out.println("Simulated OTP Code: " + otp);
            System.out.println("Configure SMTP credentials in your .env file to enable real emails.");
            System.out.println("===================================================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(toEmail);
            message.setSubject("ShopStack - Reset Password Verification OTP");
            message.setText("Dear User,\n\n" +
                    "We received a request to reset your password. Use the verification code (OTP) below to reset it:\n\n" +
                    "Verification OTP: " + otp + "\n\n" +
                    "This code will expire in 15 minutes.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "ShopStack Team");

            mailSender.send(message);
            System.out.println("Successfully sent OTP email to " + toEmail);
        } catch (Exception e) {
            System.out.println("===================================================================");
            System.out.println("ERROR: Failed to send real email to " + toEmail);
            System.out.println("Error Message: " + e.getMessage());
            System.out.println("Simulated OTP Code (Fallback): " + otp);
            System.out.println("===================================================================");
        }
    }
}
