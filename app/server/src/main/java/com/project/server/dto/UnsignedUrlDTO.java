package com.project.server.dto;

import javax.validation.constraints.NotBlank;
import static com.project.server.constants.Constants.*;

public class UnsignedUrlDTO {
    @NotBlank(message = URL_EMPTY_ERROR_MESSAGE)
    private String url;

    @NotBlank(message = HTTP_METHOD_EMPTY_ERROR_MESSAGE)
    private String method;

    public String getUrl() {
        return this.url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getMethod() {
        return this.method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

}
