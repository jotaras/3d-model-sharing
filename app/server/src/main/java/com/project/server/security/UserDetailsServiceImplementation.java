package com.project.server.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.project.server.constants.Constants;
import com.project.server.dao.UserDAO;
import com.project.server.domain.Role;
import com.project.server.domain.User;
import com.project.server.exceptions.UserNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImplementation implements UserDetailsService {
    @Autowired
    UserDAO userDAO;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            User user = userDAO.getUserByEmail(email);
            List<Role> userRoles = userDAO.getUserRoles(user.getId());
            Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
            userRoles.forEach(role -> authorities.add(new SimpleGrantedAuthority(role.getName())));
            return new AuthenticatedUser(user.getEmail(), user.getPassword(), authorities, user.getId());
        } catch (UserNotFoundException userNotFoundException) {
            throw new UsernameNotFoundException(Constants.USER_NOT_FOUND_ERROR_MESSAGE);
        }
    }


}
