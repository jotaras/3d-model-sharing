package com.project.server;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.project.server.exceptions.ModelNotFoundException;
import com.project.server.exceptions.NoRefreshTokenException;
import com.project.server.exceptions.RefreshTokenNotValidException;
import com.project.server.exceptions.RoleAlreadyExistsException;
import com.project.server.exceptions.RolesDoNotExistExcepton;
import com.project.server.exceptions.TagsDoNotExistException;
import com.project.server.exceptions.UserEmailIsUsedException;
import com.project.server.exceptions.UserNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.List;
import static com.project.server.constants.Constants.*;


@RestControllerAdvice
public class GlobalExceptionHandler {
    

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException validationException) {

        StringBuilder message = new StringBuilder();
        List<FieldError> errors = validationException.getBindingResult().getFieldErrors();
        
        for(FieldError err: errors) {
           message.append("\n" + err.getDefaultMessage());
        }
        return new ResponseEntity<>(INPUT_NOT_VALID_ERROR_MESSAGE + message.toString(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleUserNotFound(UserNotFoundException userNotFoundException) {
        return new ResponseEntity<>(userNotFoundException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RolesDoNotExistExcepton.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleRolesExistException(RolesDoNotExistExcepton rolesDoNotExistExcepton) {
        return new ResponseEntity<>(INPUT_NOT_VALID_ERROR_MESSAGE + rolesDoNotExistExcepton.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RoleAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleRoleExistsException(RoleAlreadyExistsException roleAlreadyExistsException) {
        return new ResponseEntity<>(roleAlreadyExistsException.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ModelNotFoundException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleModelNotFound(ModelNotFoundException modelNotFoundException) {
        return new ResponseEntity<>(modelNotFoundException.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TagsDoNotExistException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleTagsDoNotExistException(TagsDoNotExistException tagsDoNotExistException) {
        return new ResponseEntity<>(INPUT_NOT_VALID_ERROR_MESSAGE + tagsDoNotExistException.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserEmailIsUsedException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<String> handleUserEmailBusy(UserEmailIsUsedException exception) {
        return new ResponseEntity<>(exception.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler({RefreshTokenNotValidException.class, NoRefreshTokenException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<String> handleAuthorization(Exception exception) {
        return new ResponseEntity<>(exception.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<String> handleAccessDenied(Exception exception) {
        return new ResponseEntity<>(exception.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<String> handleError(Exception exception) {
        return new ResponseEntity<>("Internal error: " + exception, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
