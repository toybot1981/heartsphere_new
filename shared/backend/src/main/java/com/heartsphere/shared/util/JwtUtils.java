package com.heartsphere.shared.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT 工具类
 * 从 backend 模块迁移到 shared 模块，供所有子项目使用
 */
@Component
public class JwtUtils {

    @Value("${jwt.secret:your-secret-key-change-in-production}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private int jwtExpirationMs;

    // 静态初始化块：显式加载 JWT 实现与 Jackson 序列化类，避免 ServiceLoader 找不到实现导致 NoSuchElementException
    static {
        try {
            Class.forName("io.jsonwebtoken.impl.DefaultJwtParserBuilder");
            Class.forName("io.jsonwebtoken.impl.DefaultJwtBuilder");
            Class.forName("io.jsonwebtoken.jackson.io.JacksonDeserializer");
            Class.forName("io.jsonwebtoken.jackson.io.JacksonSerializer");
        } catch (ClassNotFoundException e) {
            System.err.println("Warning: JWT implementation classes not found: " + e.getMessage());
        }
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateJwtTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }

        return false;
    }
}
