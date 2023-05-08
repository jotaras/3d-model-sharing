package com.project.server.exceptions;

public class NoRefreshTokenException extends RuntimeException {
    public NoRefreshTokenException(String message) {
        super(message);
    }
}
