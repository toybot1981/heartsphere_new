package com.heartsphere.mentis.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * 用户详情实现类
 * 与主客户端使用相同的认证机制，实现单点登录
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {
    
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String username;
    private String email;
    private String password;
    private Boolean isEnabled;
    private Collection<? extends GrantedAuthority> authorities;
    
    public static UserDetailsImpl build(Long userId, String username) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        return UserDetailsImpl.builder()
                .id(userId)
                .username(username)
                .password("")
                .isEnabled(true)
                .authorities(authorities)
                .build();
    }
    
    public static UserDetailsImpl build(Long userId, String username, String email) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        return UserDetailsImpl.builder()
                .id(userId)
                .username(username)
                .email(email)
                .password("")
                .isEnabled(true)
                .authorities(authorities)
                .build();
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities != null ? authorities : Collections.emptyList();
    }
    
    @Override
    public String getPassword() {
        return password != null ? password : "";
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isEnabled != null ? isEnabled : true;
    }
}
