package com.project.server.services;


import java.util.Collection;
import java.util.LinkedList;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.server.dao.UserDAO;
import com.project.server.domain.Role;
import com.project.server.domain.User;
import com.project.server.dto.RoleDTO;
import com.project.server.dto.UserDTO;

@Service
public class UserService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    UserDAO userDao;

    public Collection<UserDTO> getAllUsers() {
        Collection<User> users = userDao.getAllUsers();
        Collection<UserDTO> usersDto = new LinkedList<>();
        for(User user: users) {
            usersDto.add(userToUserDto(user));
        }
        return usersDto;
    }

    public UserDTO createUser(UserDTO userDto) {
        User createdUser = userDao.createUser(userDtoToUser(userDto), userDto.getDTORoleIds());
        return userToUserDto(createdUser);
    }

    public UserDTO getUserById(Integer id) {
        User createdUser = userDao.getUserById(id);
        return userToUserDto(createdUser);
    }

    public UserDTO updateUser(UserDTO userDto, Integer userId) {
        User updatedUser = userDao.updateUser(userDtoToUser(userDto), userId, userDto.getDTORoleIds());
        return userToUserDto(updatedUser);
    }

    public void deleteUser(Integer userId) {
        userDao.deleteUser(userId);
    }

    public RoleDTO createRole(RoleDTO roleDto) {
        Role createdRole = userDao.createRole(roleDtoToRole(roleDto));
        return roleToRoleDto(createdRole);
    }

    public Collection<RoleDTO> getAllRoles() {
        Collection<Role> roles = userDao.getAllRoles();
        Collection<RoleDTO> rolesDto = new LinkedList<>();
        for(Role role: roles) {
            rolesDto.add(roleToRoleDto(role));
        }
        return rolesDto;
    }

    
    private User userDtoToUser(UserDTO userDto) {
        User user = new User();
        user.setFirstName(userDto.getDTOFirstName());
        user.setLastName(userDto.getDTOLastName());
        user.setEmail(userDto.getDTOEmail());
        if (Objects.nonNull(userDto.getDTOPassword())) {
            user.setPassword(passwordEncoder.encode(userDto.getDTOPassword()));
        }
        user.setImageBlobKey(userDto.getDTOImageBlobKey());
        return user;
    }

    private UserDTO userToUserDto(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setDTOId(user.getId());
        userDTO.setDTOFirstName(user.getFirstName());
        userDTO.setDTOLastName(user.getLastName());
        userDTO.setDTOEmail(user.getEmail());
        userDTO.setDTOImageBlobKey(user.getImageBlobKey());
        userDTO.setDTORoleIds(user.getRoles().stream().map(role -> role.getId()).collect(Collectors.toSet()));
        return userDTO;
    }

    private RoleDTO roleToRoleDto(Role role) {
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setRoleId(role.getId());
        roleDTO.setName(role.getName());
        return roleDTO;
    }

    private Role roleDtoToRole(RoleDTO roleDto) {
        Role role = new Role();
        role.setName(roleDto.getName());
        return role;
    }


}