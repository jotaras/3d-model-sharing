package com.project.server.exceptions;

public class RefreshTokenNotValidException extends RuntimeException {
    public RefreshTokenNotValidException(String message) {
        super(message);
    }    
}
