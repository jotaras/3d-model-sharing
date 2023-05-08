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
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;


@Entity
@Table(name = "users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
    private Integer userId;

	@Column(name = "firstName")
	private String firstName;

	@Column(name = "lastName")
	private String lastName;

	@Column(name = "email")
	private String email;

	@Column(name = "password")
	private String password;

	@Column(name = "imageBlobKey")
    private String imageBlobKey;
	
	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
		name = "user_role",
		joinColumns = {@JoinColumn(name = "user_id")},	
		inverseJoinColumns = {@JoinColumn(name = "role_id")}
	)
	private Set<Role> roles = new HashSet<>();
	
	public User() {}

	public User(String firstName, String lastName, String email, String imageBlobKey) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.imageBlobKey = imageBlobKey;
	}

	public Integer getId() {
		return this.userId;
	}

	public void setId(Integer userId) {
		this.userId = userId;
	}

	public String getFirstName() {
		return this.firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getLastName() {
		return this.lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return this.email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getImageBlobKey() {
		return this.imageBlobKey;
	}

	public void setImageBlobKey(String imageBlobKey) {
		this.imageBlobKey = imageBlobKey;
	}

	public void addRole(Role role) {
        roles.add(role);
		role.getUsers().add(this);
    }

	public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

	public void removeRole(Role role) {
        roles.remove(role);
		role.getUsers().remove(this);
    }

    public Set<Role> getRoles() {
        return roles;
    }

	@Override
	public boolean equals(Object object) {
		if (object == this)
			return true;
		if (!(object instanceof User)) {
			return false;
		}
		User user = (User) object;
		return Objects.equals(userId, user.userId) && 
			Objects.equals(firstName, user.firstName) && 
			Objects.equals(lastName, user.lastName) && 
			Objects.equals(email, user.email) && 
			Objects.equals(imageBlobKey, user.imageBlobKey);
	}

	@Override
	public int hashCode() {
		return Objects.hash(userId, firstName, lastName, email, imageBlobKey);
	}


	@Override
	public String toString() {
		return "{" +
			" userId='" + getId() + "'" +
			", firstName='" + getFirstName() + "'" +
			", lastName='" + getLastName() + "'" +
			", email='" + getEmail() + "'" +
			", imageBlobKey='" + getImageBlobKey() + "'" +
			", roles='" + getRoles() + "'" +
			"}";
	}

}
