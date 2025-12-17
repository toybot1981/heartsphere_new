package com.heartsphere;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswordHashTest {
    @Test
    public void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "123456";
        String hash = encoder.encode(password);
        System.out.println("\n========================================");
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("========================================\n");
        System.out.println("SQL Update Command:");
        System.out.println("UPDATE system_admin SET password = '" + hash + "' WHERE username = 'admin';");
    }
}

