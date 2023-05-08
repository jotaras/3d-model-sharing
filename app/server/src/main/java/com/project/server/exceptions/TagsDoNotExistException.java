package com.project.server.exceptions;

public class TagsDoNotExistException extends RuntimeException{
    public TagsDoNotExistException(String message) {
        super(message);
    }
}
