package com.project.server.exceptions;

public class UserEmailIsUsedException extends RuntimeException{
    public UserEmailIsUsedException(String message) {
        super(message);
    }
}
