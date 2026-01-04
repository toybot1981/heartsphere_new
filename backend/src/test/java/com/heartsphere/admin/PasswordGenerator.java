package com.heartsphere.admin;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Tyx@19811009";
        String encoded = encoder.encode(password);
        System.out.println(encoded);
    }
}
