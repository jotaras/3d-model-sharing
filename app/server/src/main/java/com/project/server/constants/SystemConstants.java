package com.project.server.constants;

public final class SystemConstants {
    private SystemConstants() {}

    public static final String MODELS_ROUTE = "/api/models";
    public static final String USERS_ROUTE = "/api/users";
    public static final String AUTH_ROUTE = "/api/auth";
    public static final String TAGS_ROUTE = "/api/models/tags";
    public static final String ROLES_ROUTE = "/api/users/roles";
    public static final String GET_TOKEN_ROUTE = "/api/auth/get-token";
    public static final String REFRESH_TOKEN_ROUTE = "/api/auth/refresh-token";
    public static final String SIGN_URL_ROUTE = "/api/auth/sign-file-storage-url";
    public static final String FILE_STORAGE_API_URL = "https://" + System.getenv("FILE_STORAGE_API_HOST") + "/filestorage/get-signed-url";
}
