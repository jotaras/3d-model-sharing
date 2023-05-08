package com.project.server.domain;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "name")
	private String name;

    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();


    public Role() {}

    public Role(String name) {
        this.name = name;
    }

    public Integer getId() {
        return this.roleId;
    }

    public void setId(Integer id) {
        this.roleId = id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void addUser(User user) {
        users.add(user);
    }

    public Set<User> getUsers() {
        return users;
    }

    @Override
    public boolean equals(Object object) {
        if (object == this)
            return true;
        if (!(object instanceof Role)) {
            return false;
        }
        Role role = (Role) object;
        return Objects.equals(roleId, role.roleId) && Objects.equals(name, role.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roleId, name);
    }

    @Override
    public String toString() {
        return "{" +
            " roleId='" + this.roleId + "'" +
            ", name='" + this.name + "'" +
            "}";
    }


}
