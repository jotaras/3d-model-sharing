package com.project.server.controllers;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import com.project.server.dto.SignedUrlDTO;
import com.project.server.dto.UnsignedUrlDTO;
import com.project.server.security.JWTService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import static com.project.server.constants.SystemConstants.*;

@RestController
public class AuthenticationController {
    
    @Autowired
    private JWTService jwtService;

    @Autowired
    RestTemplate restTemplate;

    @PostMapping(REFRESH_TOKEN_ROUTE)
    public Map<String, String> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        Map<String, String> body = new HashMap<>();
        String accessToken = jwtService.refreshToken(request);
        body.put("accessToken", accessToken);
        return body;
    }

    @PreAuthorize("hasAnyAuthority('Admin', 'User')")
    @PostMapping(SIGN_URL_ROUTE)
    public SignedUrlDTO signURL(@RequestBody @Valid UnsignedUrlDTO url) {
        return restTemplate.postForObject(FILE_STORAGE_API_URL, url, SignedUrlDTO.class);
    }
    
}
