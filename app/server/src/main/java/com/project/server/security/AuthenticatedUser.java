package com.project.server.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class AuthenticatedUser extends User {
    private final Integer userId;
    private final String email;

    public Integer getUserId() {
        return this.userId;
    }

    public String getEmail() {
        return this.email;
    }

    public AuthenticatedUser(String email, String password, Collection<? extends GrantedAuthority> authorities, Integer userId) {
        super(email, password, authorities);
        this.userId = userId; 
        this.email = email;
    }
}
