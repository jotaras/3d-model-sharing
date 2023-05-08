package com.project.server.dto;

import java.io.Serializable;
import java.util.Objects;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Null;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class RoleDTO implements Serializable {

    @Null
    private Integer roleId;

    @NotBlank
    @Size(max = 40)
    @Pattern(regexp = "[a-zA-Z]+")
    private String name;
    
    
    public Integer getRoleId() {
        return this.roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object object) {
        if (object == this)
            return true;
        if (!(object instanceof RoleDTO)) {
            return false;
        }
        RoleDTO roleDTO = (RoleDTO) object;
        return Objects.equals(roleId, roleDTO.roleId) && Objects.equals(name, roleDTO.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roleId, name);
    }

    @Override
    public String toString() {
        return "{" +
            " roleId='" + getRoleId() + "'" +
            ", name='" + getName() + "'" +
            "}";
    }
    
}
