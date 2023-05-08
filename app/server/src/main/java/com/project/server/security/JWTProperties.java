package com.project.server.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt.properties")
public class JWTProperties {
    private String secret;
    private Integer accessTokenExpiry;
    private Integer refreshTokenExpiry;

    public String getSecret() {
        return this.secret;
    }
    public Integer getAccessTokenExpiry() {
        return this.accessTokenExpiry;
    }

    public Integer getRefreshTokenExpiry() {
        return this.refreshTokenExpiry;
    }
    public void setSecret(String secret) {
        this.secret = secret;
    }
    public void setAccessTokenExpiry(Integer accessTokenExpiry) {
        this.accessTokenExpiry = accessTokenExpiry;
    }
    public void setRefreshTokenExpiry(Integer refreshTokenExpiry) {
        this.refreshTokenExpiry = refreshTokenExpiry;
    }
    
}
