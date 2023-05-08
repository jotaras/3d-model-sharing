package com.project.server.controllers;

import java.util.Collection;

import javax.validation.Valid;
import javax.validation.groups.Default;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.project.server.dto.RoleDTO;
import com.project.server.dto.UserDTO;
import com.project.server.dto.OnCreateI;
import com.project.server.services.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import static com.project.server.constants.SystemConstants.*;


@RestController
public class UserController {
    
    @Autowired
    UserService userService;

    @GetMapping(USERS_ROUTE)
    public Collection<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping(USERS_ROUTE + "/{id}")
    public UserDTO getUserById(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    @GetMapping(ROLES_ROUTE)
    public Collection<RoleDTO> getAllRoles() {
        return userService.getAllRoles();
    }

    @PreAuthorize("hasAuthority('Admin')")  
    @PostMapping(USERS_ROUTE)
    public UserDTO createUser(@Validated({OnCreateI.class, Default.class}) @RequestBody UserDTO userDto) {
        return userService.createUser(userDto);
    }

    @PreAuthorize("hasAuthority('Admin')") 
    @PostMapping(ROLES_ROUTE)
    public RoleDTO createRole(@Valid @RequestBody RoleDTO roleDto) {
        return userService.createRole(roleDto);
    }
    
    @PreAuthorize("hasAuthority('Admin')")  
    @PutMapping(USERS_ROUTE + "/{id}")
    public UserDTO updateUser(@Valid @RequestBody UserDTO userDto, @PathVariable Integer id) {
        return userService.updateUser(userDto, id);
    }

    @PreAuthorize("hasAuthority('Admin')")  
    @DeleteMapping(USERS_ROUTE + "/{id}")
    public void deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
    }

}