package com.ecommerce.project.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncEmailSender {

    private static final Logger log = LoggerFactory.getLogger(AsyncEmailSender.class);

    private final JavaMailSender mailSender;

    public AsyncEmailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String from, String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception exception) {
            log.warn("Unable to send email to {} with subject '{}': {}", to, subject, exception.getMessage());
        }
    }
}
