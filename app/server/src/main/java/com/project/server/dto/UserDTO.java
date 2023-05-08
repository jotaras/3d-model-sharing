package com.project.server.dto;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Null;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import static com.project.server.constants.Constants.*;

public class UserDTO implements Serializable{

    @Null 
    private Integer id;

    @NotBlank(message = USER_FIRST_NAME_BLANK_ERROR_MESSAGE)
    @Size(max = 40, message = USER_FIRST_NAME_SIZE_ERROR_MESSAGE)
    @Pattern(regexp = "[a-zA-Z]+", message = USER_FIRST_NAME_PATTERN_ERROR_MESSAGE)
    private String firstName;

    @NotBlank(message = USER_LAST_NAME_BLANK_ERROR_MESSAGE)
    @Size(max = 40, message = USER_LAST_NAME_SIZE_ERROR_MESSAGE)
    @Pattern(regexp = "[a-zA-Z]+", message = USER_LAST_NAME_PATTERN_ERROR_MESSAGE)
    private String lastName;

    @NotBlank(message = USER_EMAIL_BLANK_ERROR_MESSAGE)
    @Email
    private String email;

    @Size(min = 4, max = 25, message = USER_PASSWORD_SIZE_ERROR_MESSAGE)
    @NotBlank(message = USER_PASSWORD_BLANK_ERROR_MESSAGE, groups = OnCreateI.class)
    private String password;

    private String imageBlobKey;

    @NotEmpty(message = USER_ROLES_EMPTY_ERROR_MESSAGE)
    private Set<Integer> roleIds = new HashSet<>();


    @JsonProperty("id")
    public Integer getDTOId() {
        return this.id;
    }

    @JsonProperty("id")
    public void setDTOId(Integer id) {
        this.id = id;
    }

    @JsonProperty("firstName")
    public String getDTOFirstName() {
        return this.firstName;
    }

    @JsonProperty("firstName")
    public void setDTOFirstName(String firstName) {
        this.firstName = firstName;
    }

    @JsonProperty("lastName")
    public String getDTOLastName() {
        return this.lastName;
    }

    @JsonProperty("lastName")
    public void setDTOLastName(String lastName) {
        this.lastName = lastName;
    }

    @JsonProperty("email")
    public String getDTOEmail() {
        return this.email;
    }

    @JsonProperty("email")
    public void setDTOEmail(String email) {
        this.email = email;
    }

    
    @JsonProperty("password")
    public void setDTOPassword(String password) {
        this.password = password;
    }

    @JsonIgnore
    public String getDTOPassword() {
        return this.password;
    }

    @JsonProperty("imageBlobKey")
    public String getDTOImageBlobKey() {
        return this.imageBlobKey;
    }

    @JsonProperty("imageBlobKey")
    public void setDTOImageBlobKey(String imageBlobKey) {
        this.imageBlobKey = imageBlobKey;
    }

    @JsonProperty("roleIds")
    public Set<Integer> getDTORoleIds() {
        return this.roleIds;
    }

    @JsonProperty("roleIds")
    public void setDTORoleIds(Set<Integer> roleIds) {
        this.roleIds = roleIds;
    }

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof UserDTO)) {
            return false;
        }
        UserDTO userDTO = (UserDTO) o;

        return Objects.equals(firstName, userDTO.firstName) && 
        Objects.equals(lastName, userDTO.lastName) && 
        Objects.equals(email, userDTO.email) && 
        Objects.equals(imageBlobKey, userDTO.imageBlobKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstName, lastName, email, imageBlobKey);
    }

    @Override
    public String toString() {
        return "{" +
            " firstName='" + getDTOFirstName() + "'" +
            ", lastName='" + getDTOLastName() + "'" +
            ", email='" + getDTOEmail() + "'" +
            ", imageBlobKey='" + getDTOImageBlobKey() + "'" +
            ", roleIds='" + getDTORoleIds() + "'" +
            "}";
    }
    
}
