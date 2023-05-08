package com.project.server;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;

import com.project.server.dao.UserDAO;
import com.project.server.domain.Role;
import com.project.server.domain.User;
import com.project.server.dto.RoleDTO;
import com.project.server.dto.UserDTO;
import com.project.server.exceptions.UserNotFoundException;
import com.project.server.services.UserService;
import static com.project.server.constants.Constants.*; 

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static com.project.server.TestConstantsAndTemplates.*; 

@ExtendWith(MockitoExtension.class)
public class UsersServiceTest {
    
    @InjectMocks
    UserService userService;

    @Mock
    UserDAO userDAO;

    @Mock
    PasswordEncoder passwordEncoder;


    @Test
    public void testGetAllUsers() {
        User user = getUserFromDAO();
        List<User> users = new LinkedList<>();
        users.add(user);

        when(userDAO.getAllUsers()).thenReturn(users);

        List<UserDTO> usersFromDAO = new LinkedList<>(userService.getAllUsers());
        assertEquals(1, usersFromDAO.size());
        assertEquals(usersFromDAO.get(0).getDTOId(), user.getId());
        assertEquals(usersFromDAO.get(0).getDTORoleIds(), TEST_ROLE_IDS);
    }

    @Test
    public void testCreateUser() {
        User user = getUserFromDAO();
        when(userDAO.createUser(any(User.class), anyCollection())).thenReturn(user);

        UserDTO createdUser = userService.createUser(getUserFromRequest());

        assertEquals(createdUser.getDTOId(), 1);
        assertEquals(createdUser.getDTORoleIds(), TEST_ROLE_IDS);
    }

    @Test
    public void testUpdateUser() {
        User user = getUserFromDAO();
        Role role3 = new Role();
        role3.setId(3);
        role3.setName("New role");
        user.addRole(role3);

        when(userDAO.updateUser(any(User.class), anyInt(), anyCollection())).thenReturn(user);

        UserDTO updatedUser = userService.updateUser(getUserFromRequest(), 1);

        assertEquals(updatedUser.getDTOId(), 1);
        assertEquals(updatedUser.getDTORoleIds(), new HashSet<>(Arrays.asList(1 ,2 ,3)));
    }

    @Test
    public void testUpdateUserWhenUserDoesNotExist() {
        when(userDAO.updateUser(any(User.class), anyInt(), anyCollection())).thenThrow(new UserNotFoundException(USER_NOT_FOUND_ERROR_MESSAGE));

        Throwable thrown = assertThrows(UserNotFoundException.class, () -> userService.updateUser(getUserFromRequest(), 1));
        assertEquals(thrown.getMessage(), USER_NOT_FOUND_ERROR_MESSAGE);
    }

    @Test
    public void testDeleteUser() {
        doNothing().when(userDAO).deleteUser(anyInt());
        userService.deleteUser(1);

        verify(userDAO, times(1)).deleteUser(1);
    }

    @Test
    public void testGetAllRoles() {
        Role role1 = new Role();
        role1.setName(TEST_FIRST_ROLE_NAME);
        role1.setId(TEST_FIRST_ROLE_ID);
        Role role2 = new Role();
        role2.setName(TEST_SECOND_ROLE_NAME);
        role2.setId(TEST_SECOND_ROLE_ID);
        List<Role> roles = new LinkedList<>();
        roles.add(role1);
        roles.add(role2);

        when(userDAO.getAllRoles()).thenReturn(roles);

        List<RoleDTO> rolesFromService = new LinkedList<>(userService.getAllRoles());
        assertEquals(2, rolesFromService.size());
        assertEquals(rolesFromService.get(0).getName(), TEST_FIRST_ROLE_NAME);
        assertEquals(rolesFromService.get(0).getRoleId(), TEST_FIRST_ROLE_ID);
        assertEquals(rolesFromService.get(1).getName(), TEST_SECOND_ROLE_NAME);
        assertEquals(rolesFromService.get(1).getRoleId(), TEST_SECOND_ROLE_ID);
    }

    
    @Test
    public void testCreateRole() {
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setName(TEST_FIRST_ROLE_NAME);

        Role role = new Role();
        role.setId(TEST_FIRST_ROLE_ID);
        role.setName(TEST_FIRST_ROLE_NAME);
     
        when(userDAO.createRole(any(Role.class))).thenReturn(role);
        RoleDTO createdRole = userService.createRole(roleDTO);

        assertEquals(createdRole.getName(), roleDTO.getName());
    }
}
