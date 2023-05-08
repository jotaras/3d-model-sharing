package com.project.server.dao;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.project.server.domain.Role;
import com.project.server.domain.User;
import com.project.server.exceptions.RoleAlreadyExistsException;
import com.project.server.exceptions.RolesDoNotExistExcepton;
import com.project.server.exceptions.UserEmailIsUsedException;
import com.project.server.exceptions.UserNotFoundException;
import static com.project.server.constants.Constants.*;



@Repository
public class UserDAO {

    @PersistenceContext
    EntityManager entityManager;


    public List<User> getAllUsers() {
        TypedQuery<User> getUsersQuery = entityManager.createQuery("SELECT c FROM User c", User.class);
        return getUsersQuery.getResultList();
    }

    public List<Role> getAllRoles() {
        TypedQuery<Role> getRolesQuery = entityManager.createQuery("SELECT c FROM Role c", Role.class);
        return getRolesQuery.getResultList();
    }

    @Transactional
    public User createUser(User user, Collection<Integer> rolesId) {
        try {
            getUserByEmail(user.getEmail());
            throw new UserEmailIsUsedException(USER_EMAIL_IS_USED_ERROR_MESSAGE);
        } catch (UserNotFoundException exception) {
            List<Integer> rolesThatDoesNotExist = new LinkedList<>();

            for (Integer roleId: rolesId) {
                Role role = entityManager.find(Role.class, roleId);
                if (Objects.isNull(role)) {
                    rolesThatDoesNotExist.add(roleId);
                    continue;
                }
                user.addRole(role);
            }

            if (!rolesThatDoesNotExist.isEmpty()) {
                throw new RolesDoNotExistExcepton(ROLES_DO_NOT_EXIST_ERROR_MESSAGE + rolesThatDoesNotExist);
            }
            entityManager.persist(user);
            return user;
        }
    }

    @Transactional
    public User updateUser (User user, Integer updateUserId, Collection<Integer> rolesId) {
        User updatedUser = entityManager.find(User.class, updateUserId);

        if (Objects.isNull(updatedUser)) {
            throw new UserNotFoundException(USER_NOT_FOUND_ERROR_MESSAGE);
        }

        User userFoundByEmail;
        try {
            userFoundByEmail = getUserByEmail(user.getEmail());
        } catch (UserNotFoundException exception) {
            userFoundByEmail = null;
        }

        if (Objects.nonNull(userFoundByEmail) && !userFoundByEmail.getId().equals(updateUserId)) {
            throw new UserEmailIsUsedException(USER_EMAIL_IS_USED_ERROR_MESSAGE);
        }

        Set<Role> newRoles = new HashSet<>(); 
        List<Integer> rolesThatDoesNotExist = new LinkedList<>();

        for (Integer roleId: rolesId) {

            Role role = entityManager.find(Role.class, roleId);
            if (Objects.isNull(role)) {
                rolesThatDoesNotExist.add(roleId);
                continue;
            }
            newRoles.add(role);
        }

        if (!rolesThatDoesNotExist.isEmpty()) {
            throw new RolesDoNotExistExcepton(ROLES_DO_NOT_EXIST_ERROR_MESSAGE + rolesThatDoesNotExist);
        }
        
        updatedUser.setEmail(user.getEmail());
        updatedUser.setFirstName(user.getFirstName());
        updatedUser.setLastName(user.getLastName());
        updatedUser.setImageBlobKey(user.getImageBlobKey());
        updatedUser.setRoles(newRoles);
        String password = user.getPassword();
        if (Objects.nonNull(password)) {
            updatedUser.setPassword(password);
        }

        return updatedUser;
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = entityManager.find(User.class, userId);
        if (Objects.isNull(user)) {
            throw new UserNotFoundException(USER_NOT_FOUND_ERROR_MESSAGE);
        }
        entityManager.remove(user);
    }

    @Transactional
    public Role createRole(Role role) {
        TypedQuery<Role> getRoleQuery = entityManager.createQuery("SELECT c FROM Role c Where c.name = :nameParam", Role.class);
        getRoleQuery.setParameter("nameParam", role.getName());
        
        if (getRoleQuery.getResultList().isEmpty()) {
            entityManager.persist(role);
            return role;
        } else {
            throw new RoleAlreadyExistsException(ROLE_ALREADY_EXISTS_ERROR_MESSAGE);
        }
    }

    public List<Role> getUserRoles(Integer userId) {
        TypedQuery<Role> getUserRolesQuery = entityManager.createQuery("SELECT r FROM Role r JOIN FETCH r.users u WHERE u.userId = :userId", Role.class);

        getUserRolesQuery.setParameter("userId", userId);
        return getUserRolesQuery.getResultList();
    }

    public User getUserByEmail(String email) {
        TypedQuery<User> getUserByEmailQuery = entityManager.createQuery("SELECT u FROM User u Where u.email = :emailParameter", User.class);
        getUserByEmailQuery.setParameter("emailParameter", email);

        try {
            return getUserByEmailQuery.getSingleResult();
        } catch(NoResultException noResultException) {
            throw new UserNotFoundException(USER_NOT_FOUND_ERROR_MESSAGE);
        }
    }

    public User getUserById(Integer id) {
        User updatedUser = entityManager.find(User.class, id);

        if (Objects.isNull(updatedUser)) {
            throw new UserNotFoundException(USER_NOT_FOUND_ERROR_MESSAGE);
        }
        return updatedUser;
    }

}
