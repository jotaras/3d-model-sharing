package com.project.server.constants;

public final class Constants {
    private Constants() {}

    public static final String MODEL_NOT_FOUND_ERROR_MESSAGE = "Model not found";
    public static final String USER_NOT_FOUND_ERROR_MESSAGE = "User not found";
    public static final String ROLES_DO_NOT_EXIST_ERROR_MESSAGE = "Roles don't exist: ";
    public static final String ROLE_ALREADY_EXISTS_ERROR_MESSAGE = "Role already exists";
    public static final String TAGS_DO_NOT_EXIST_ERROR_MESSAGE = "Tags don't exist: ";
    public static final String USER_FIRST_NAME_BLANK_ERROR_MESSAGE = "Specify first name";
    public static final String USER_FIRST_NAME_SIZE_ERROR_MESSAGE = "Number ofNcharacters exceeded 40";
    public static final String USER_FIRST_NAME_PATTERN_ERROR_MESSAGE = "First name must contain only letters";
    public static final String USER_LAST_NAME_BLANK_ERROR_MESSAGE = "Specify last name";
    public static final String USER_LAST_NAME_SIZE_ERROR_MESSAGE = "Number of characters exceeded 40";
    public static final String USER_LAST_NAME_PATTERN_ERROR_MESSAGE = "Last name must contain only letters";
    public static final String USER_EMAIL_BLANK_ERROR_MESSAGE = "Specify email";
    public static final String USER_PASSWORD_BLANK_ERROR_MESSAGE = "Specify password";
    public static final String USER_PASSWORD_SIZE_ERROR_MESSAGE = "Password length should be between 4 and 25";
    public static final String USER_ROLES_EMPTY_ERROR_MESSAGE = "Select at least one role";
    public static final String TAG_NAME_EMPTY_ERROR_MESSAGE = "Specify tag name";
    public static final String TAG_SIZE_ERROR_MESSAGE = "Number of characters exceeded 15";
    public static final String MODEL_NAME_EMPTY_ERROR_MESSAGE = "Specify model name";
    public static final String MODEL_NAME_SIZE_ERROR_MESSAGE = "Number of characters exceeded 40";
    public static final String MODEL_DESC_EMPTY_ERROR_MESSAGE = "Specify model description";
    public static final String MODEL_DESC_SIZE_ERROR_MESSAGE = "Number of characters exceeded 500";
    public static final String MODEL_FILE_KEY_SIZE_ERROR_MESSAGE = "Number of characters exceeded 40";
    public static final String MODEL_PREVIEW_KEY_SIZE_ERROR_MESSAGE = "Number of characters exceeded 40";
    public static final String INPUT_NOT_VALID_ERROR_MESSAGE = "Input is not valid: ";
    public static final String USER_EMAIL_IS_USED_ERROR_MESSAGE = "This email is already used";
    public static final String AUTHENTICATION_FAILED_ERROR_MESSAGE = "Authentication failed, email or password is incorrect";
    public static final String REFRESH_TOKEN_NOT_VALID_ERROR_MESSAGE = "Refresh token is not valid";
    public static final String NO_REFRESH_TOKEN_ERROR_MESSAGE = "No refresh token in header";
    public static final String URL_EMPTY_ERROR_MESSAGE = "Specify URL";
    public static final String HTTP_METHOD_EMPTY_ERROR_MESSAGE = "Specify HTTP method";
    public static final String ACCESSTOKEN_NOT_VALID_ERROR_MESSAGE = "Access token is not valid";
    public static final String AUTHORIZATION_FAILED_ERROR_MESSAGE = "You have no access";
    public static final String NO_ACCESS_TOKEN_ERROR_MESSAGE = "No access token in header";
}
