package com.project.server;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import javax.servlet.http.HttpServletRequest;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.server.controllers.AuthenticationController;
import com.project.server.dao.UserDAO;
import com.project.server.exceptions.TestException;
import com.project.server.security.AuthenticatedUser;
import com.project.server.security.JWTService;
import com.project.server.security.UserDetailsServiceImplementation;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import static com.project.server.TestConstantsAndTemplates.*;
import static com.project.server.constants.SystemConstants.*;
import static com.project.server.constants.Constants.*;

@ExtendWith(SpringExtension.class)
@WebMvcTest(AuthenticationController.class)
public class AuthenticationControllerTest {
    @Autowired
    MockMvc mockMvc;

    @MockBean
    JWTService jwtService;

    @MockBean
    RestTemplate restTemplate;

    @MockBean
    private UserDetailsServiceImplementation userDetailsServiceImplementation;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    UserDAO userDAO;


    @Test
    public void testRefreshAccessToken() throws TestException {
        when(jwtService.refreshToken(any(HttpServletRequest.class))).thenReturn(TEST_ACCESS_TOKEN);

        try {
            mockMvc.perform(post(REFRESH_TOKEN_ROUTE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", Matchers.is(TEST_ACCESS_TOKEN)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(jwtService, times(1)).refreshToken(any());
    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testSignUrl() throws TestException, JsonProcessingException {

        when(restTemplate.postForObject(anyString(), any(), any())).thenReturn(getTestSignedUrl());
        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(getTestUrlToSign());
        try {
            mockMvc.perform(post(SIGN_URL_ROUTE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signedUrl", Matchers.is(TEST_SIGNED_URL)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(restTemplate, times(1)).postForObject(anyString(), any(), any());
    }

    @Test
    public void testGetTokens() throws TestException, JsonProcessingException, UnsupportedEncodingException {
        AuthenticatedUser user = getAuthUser();
        when(jwtService.createAccessToken(any())).thenReturn(TEST_ACCESS_TOKEN);
        when(jwtService.createRefreshToken(any())).thenReturn(TEST_REFRESH_TOKEN);
        when(userDetailsServiceImplementation.loadUserByUsername(anyString())).thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        StringBuilder encodedUrl = new StringBuilder();
        String encoding =  "UTF-8";
        encodedUrl.append(URLEncoder.encode("email", encoding));
        encodedUrl.append("=");
        encodedUrl.append(URLEncoder.encode(user.getEmail(), encoding));
        encodedUrl.append("&");
        encodedUrl.append(URLEncoder.encode("password", encoding));
        encodedUrl.append("=");
        encodedUrl.append(URLEncoder.encode(user.getPassword(), encoding));
    
        try {
            mockMvc.perform(post(GET_TOKEN_ROUTE)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .content(encodedUrl.toString())
                    .characterEncoding(ENCODING))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", Matchers.is(TEST_ACCESS_TOKEN)))
                .andExpect(jsonPath("$.refreshToken", Matchers.is(TEST_REFRESH_TOKEN)))
                .andExpect(jsonPath("$.userId", Matchers.is(user.getUserId().toString())));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(jwtService, times(1)).createAccessToken(any());
        verify(jwtService, times(1)).createRefreshToken(any());
    }

    @Test
    public void testGetTokensWhenCredentialsAreIncorrect() throws TestException, JsonProcessingException, UnsupportedEncodingException {
        AuthenticatedUser user = getAuthUser();
        when(jwtService.createAccessToken(any())).thenReturn(TEST_ACCESS_TOKEN);
        when(jwtService.createRefreshToken(any())).thenReturn(TEST_REFRESH_TOKEN);
        when(userDetailsServiceImplementation.loadUserByUsername(anyString())).thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
    
        try {
            mockMvc.perform(post(GET_TOKEN_ROUTE)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .characterEncoding(ENCODING))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$", Matchers.containsString(AUTHENTICATION_FAILED_ERROR_MESSAGE)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(jwtService, times(0)).createAccessToken(any());
    }
}
