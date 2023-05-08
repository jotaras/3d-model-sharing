package com.project.server;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;

import org.hamcrest.Matchers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.server.controllers.UserController;
import com.project.server.dto.UserDTO;
import com.project.server.exceptions.UserNotFoundException;
import com.project.server.security.JWTService;
import com.project.server.security.UserDetailsServiceImplementation;
import com.project.server.exceptions.TestException;
import com.project.server.services.UserService;

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
import static com.project.server.constants.Constants.*;
import static com.project.server.constants.SystemConstants.*; 
import static com.project.server.TestConstantsAndTemplates.*; 

@ExtendWith(SpringExtension.class)
@WebMvcTest(UserController.class)
public class UsersControllerTest {
    
    @MockBean
    UserService userService;

    @Autowired
    MockMvc mockMvc;

    @MockBean
    private UserDetailsServiceImplementation userDetailsServiceImplementation;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JWTService jwtService;


    @Test
    public void testGetAllUsers() throws JsonProcessingException, TestException {
        List<UserDTO> users = new LinkedList<>();
        UserDTO user = getUserFromService();
        users.add(user);

        when(userService.getAllUsers()).thenReturn(users);

        try {
            mockMvc.perform(get(USERS_ROUTE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].firstName", Matchers.is(TEST_USER_FIRST_NAME)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }

    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testCreateUser() throws JsonProcessingException, TestException {
        UserDTO userFromService = getUserFromService();
        UserDTO userFromRequest = getUserFromRequest();
        when(userService.createUser(any(UserDTO.class))).thenReturn(userFromService);

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(userFromRequest);
        String passwordField = "," + "\"password\":\"" + userFromRequest.getDTOPassword() + "\"}";
        String jsonWithPassword = json.replace("}", passwordField);
        try {
            mockMvc.perform(post(USERS_ROUTE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonWithPassword)
                    .characterEncoding(ENCODING))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", Matchers.is(userFromService.getDTOFirstName())))
                .andExpect(jsonPath("$.id", Matchers.is(userFromService.getDTOId())))
                .andExpect(jsonPath("$.roleIds", Matchers.containsInAnyOrder(userFromService.getDTORoleIds().toArray())));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(1)).createUser(any(UserDTO.class));
    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testUpdateUser() throws JsonProcessingException, TestException {
        UserDTO userFromService = getUserFromService();
        UserDTO userFromRequest = getUserFromRequest();
        List<Integer> newRoleIds = Arrays.asList(1);
        userFromService.setDTORoleIds(new HashSet<>(Arrays.asList(1)));

        when(userService.updateUser(any(UserDTO.class), anyInt())).thenReturn(userFromService);

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(userFromRequest);

        try {
            mockMvc.perform(put(USERS_ROUTE + "/" + TEST_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", Matchers.is(userFromService.getDTOFirstName())))
                .andExpect(jsonPath("$.id", Matchers.is(userFromService.getDTOId())))
                .andExpect(jsonPath("$.roleIds", Matchers.is(newRoleIds)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(1)).updateUser(any(UserDTO.class), anyInt());
    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testDeleteModel() throws JsonProcessingException, TestException {
        doNothing().when(userService).deleteUser(anyInt());

        try {
            mockMvc.perform(delete(USERS_ROUTE + "/" + TEST_ID))
                .andExpect(status().isOk());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(1)).deleteUser(anyInt());

    }


    @Test
    @WithMockUser(authorities = "Admin")
    public void testUpdateUserWhenUserNotFound() throws JsonProcessingException, TestException {
        UserDTO userFromRequest = getUserFromRequest();

        when(userService.updateUser(any(UserDTO.class), anyInt())).thenThrow(new UserNotFoundException(USER_NOT_FOUND_ERROR_MESSAGE));

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(userFromRequest);
        try {
            mockMvc.perform(put(USERS_ROUTE + "/" + TEST_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$", Matchers.containsString(USER_NOT_FOUND_ERROR_MESSAGE)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(1)).updateUser(any(UserDTO.class), anyInt());

    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testCreateUserWithInvalidInput() throws JsonProcessingException, TestException {
        UserDTO userFromService = new UserDTO();
        when(userService.createUser(any(UserDTO.class))).thenReturn(userFromService);

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(userFromService);
        try {
            mockMvc.perform(post(USERS_ROUTE)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .characterEncoding(ENCODING))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$", Matchers.containsString(INPUT_NOT_VALID_ERROR_MESSAGE)))
            .andExpect(jsonPath("$", Matchers.containsString(USER_EMAIL_BLANK_ERROR_MESSAGE)))
            .andExpect(jsonPath("$", Matchers.containsString(USER_FIRST_NAME_BLANK_ERROR_MESSAGE)))
            .andExpect(jsonPath("$", Matchers.containsString(USER_ROLES_EMPTY_ERROR_MESSAGE)))
            .andExpect(jsonPath("$", Matchers.containsString(USER_LAST_NAME_BLANK_ERROR_MESSAGE)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(0)).createUser(any(UserDTO.class));

    }
    @Test
    public void testCreateNewUserWhihoutAdminRole() throws TestException, JsonProcessingException {
        UserDTO userFromService = getUserFromService();
        UserDTO userFromRequest = getUserFromRequest();
        when(userService.createUser(any(UserDTO.class))).thenReturn(userFromService);

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(userFromRequest);
        String passwordField = "," + "\"password\":\"" + userFromRequest.getDTOPassword() + "\"}";
        String jsonWithPassword = json.replace("}", passwordField);
        try {
            mockMvc.perform(post(USERS_ROUTE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonWithPassword)
                    .characterEncoding(ENCODING))
                .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(0)).createUser(any(UserDTO.class));
    }


    @Test
    public void testUpdateUserWithoutAdminRole() throws JsonProcessingException, TestException {
        UserDTO userFromService = getUserFromService();
        UserDTO userFromRequest = getUserFromRequest();

        when(userService.updateUser(any(UserDTO.class), anyInt())).thenReturn(userFromService);

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(userFromRequest);

        try {
            mockMvc.perform(put(USERS_ROUTE + "/" + TEST_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(0)).updateUser(any(UserDTO.class), anyInt());
    }

    @Test
    public void testDeleteModelWithoutAdminRole() throws JsonProcessingException, TestException {
        doNothing().when(userService).deleteUser(anyInt());

        try {
            mockMvc.perform(delete(USERS_ROUTE + "/" + TEST_ID))
                .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(userService, times(0)).deleteUser(anyInt());

    }
}
