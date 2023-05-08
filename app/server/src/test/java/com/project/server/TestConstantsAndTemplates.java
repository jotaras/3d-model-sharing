package com.project.server;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import com.project.server.domain.Model;
import com.project.server.domain.Role;
import com.project.server.domain.Tag;
import com.project.server.domain.User;
import com.project.server.dto.ModelDTO;
import com.project.server.dto.SignedUrlDTO;
import com.project.server.dto.UnsignedUrlDTO;
import com.project.server.dto.UserDTO;
import com.project.server.security.AuthenticatedUser;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

public final class TestConstantsAndTemplates {
    private TestConstantsAndTemplates() {}


    public static final Integer TEST_ID = 1;

    //model and user from DAO should have ids as these
    protected static final Set<Integer> TEST_TAG_IDS = new HashSet<>(Arrays.asList(1, 2));
    protected static final Set<Integer> TEST_ROLE_IDS = new HashSet<>(Arrays.asList(1, 2));

    public static final String ENCODING = "utf-8";

    public static final Long TEST_MODEL_CREATED_AT = 1637075558178L;
    public static final Integer TEST_MODEL_ID = 111;
    public static final String TEST_MODEL_NAME = "model";
    public static final String TEST_MODEL_DESCRIPTION = "description";
    public static final String TEST_MODEL_FILE_KEY = "fileKey";
    public static final String TEST_MODEL_PREVIEW_BLOB_KEY = "previewBlobKey";
    public static final Integer TEST_MODEL_CREATED_BY = 1;

    public static final Integer TEST_FIRST_TAG_ID = 1;
    public static final Integer TEST_SECOND_TAG_ID = 2;
    public static final String TEST_FIRST_TAG_NAME = "tag1";
    public static final String TEST_SECOND_TAG_NAME = "tag2";

    public static final Integer TEST_FIRST_ROLE_ID = 1;
    public static final Integer TEST_SECOND_ROLE_ID = 2;
    public static final String TEST_FIRST_ROLE_NAME = "User";
    public static final String TEST_SECOND_ROLE_NAME = "Admin";

    public static final String TEST_USER_FIRST_NAME = "firstName";
    public static final String TEST_USER_LAST_NAME = "lastName";
    public static final String TEST_USER_EMAIL = "testemail@gmail.com";
    public static final String TEST_USER_PASSWORD = "password";
    public static final String TEST_USER_IMAGE_BLOB_KEY = "imageBlobKey";

    //Sample of model that shoul be returned from service
    public static ModelDTO getModelFromService() {
        ModelDTO model = new ModelDTO();
        model.setDTOName(TEST_MODEL_NAME);
        model.setDTODescription(TEST_MODEL_DESCRIPTION);
        model.setDTOFileKey(TEST_MODEL_FILE_KEY);
        model.setDTOPreviewBlobKey(TEST_MODEL_PREVIEW_BLOB_KEY);
        model.setDTOModelId(TEST_MODEL_ID);
        model.setDTOCreatedAt(TEST_MODEL_CREATED_AT);
        model.setDTOCreatedBy(TEST_MODEL_CREATED_BY);
        model.setDTOUpdatedAt(TEST_MODEL_CREATED_AT);
        model.setDTOUpdatedBy(TEST_MODEL_CREATED_BY);
        model.setDTOTags(new HashSet<>(TEST_TAG_IDS));
        return model;
    }

    //Sample of model that come from request
    public static ModelDTO getModelFromRequest() {
        ModelDTO model = new ModelDTO();
        model.setDTOName(TEST_MODEL_NAME);
        model.setDTODescription(TEST_MODEL_DESCRIPTION);
        model.setDTOFileKey(TEST_MODEL_FILE_KEY);
        model.setDTOPreviewBlobKey(TEST_MODEL_PREVIEW_BLOB_KEY);
        model.setDTOTags(TEST_TAG_IDS);
        return model;
    }

    public static Set<Tag> getTestTagsForModel() {
        Set<Tag> tags = new HashSet<>();
        Tag tag1 = new Tag(TEST_FIRST_TAG_NAME);
        tag1.setTagId(TEST_FIRST_TAG_ID);
        Tag tag2 = new Tag(TEST_SECOND_TAG_NAME);
        tag2.setTagId(TEST_SECOND_TAG_ID);
        tags.add(tag1);
        tags.add(tag2);
        return tags;
    }

    //Sample of model that should be returned from DAO
    public static Model getModelFromDAO() {
        Model model = new Model();
        model.setName(TEST_MODEL_NAME);
        model.setDescription(TEST_MODEL_DESCRIPTION);
        model.setFileKey(TEST_MODEL_FILE_KEY);
        model.setPreviewBlobKey(TEST_MODEL_PREVIEW_BLOB_KEY);
        model.setModelId(TEST_MODEL_ID);
        model.setCreatedAt(new Timestamp(TEST_MODEL_CREATED_AT));
        model.setCreatedBy(TEST_MODEL_CREATED_BY);
        model.setUpdatedAt(new Timestamp(TEST_MODEL_CREATED_AT));
        model.setUpdatedBy(TEST_MODEL_CREATED_BY);
        model.setTags(getTestTagsForModel());
        return model;
    }

    //Sample of user that come from request
    public static UserDTO getUserFromRequest() {
        UserDTO user = new UserDTO();
        user.setDTOFirstName(TEST_USER_FIRST_NAME);
        user.setDTOLastName(TEST_USER_LAST_NAME);
        user.setDTOEmail(TEST_USER_EMAIL);
        user.setDTOPassword(TEST_USER_PASSWORD);
        user.setDTOImageBlobKey(TEST_USER_IMAGE_BLOB_KEY);
        user.setDTORoleIds(TEST_ROLE_IDS);
        return user;
    }

    //Sample of user that should be returned from service
    public static UserDTO getUserFromService() {
        UserDTO user = new UserDTO();
        user.setDTOFirstName(TEST_USER_FIRST_NAME);
        user.setDTOLastName(TEST_USER_LAST_NAME);
        user.setDTOEmail(TEST_USER_EMAIL);
        user.setDTOImageBlobKey(TEST_USER_IMAGE_BLOB_KEY);
        user.setDTORoleIds(TEST_ROLE_IDS);
        return user;
    }

    //Sample of user that should be returned from DAO
    public static User getUserFromDAO() { 
        Set<Role> roles = new HashSet<>(); 
        Role role1 = new Role();
        role1.setId(TEST_FIRST_ROLE_ID);
        role1.setName(TEST_FIRST_ROLE_NAME);
        Role role2 = new Role();
        role2.setId(TEST_SECOND_ROLE_ID);
        role2.setName(TEST_SECOND_ROLE_NAME);
        roles.add(role1);
        roles.add(role2);
        User user = new User();
        user.setId(1);
        user.setFirstName(TEST_USER_FIRST_NAME);
        user.setLastName(TEST_USER_LAST_NAME);
        user.setPassword(TEST_USER_PASSWORD);
        user.setEmail(TEST_USER_EMAIL);
        user.setImageBlobKey(TEST_USER_IMAGE_BLOB_KEY);
        user.setRoles(roles);
        return user;

    }

    public static final String TEST_ACCESS_TOKEN = "access token";
    public static final String TEST_REFRESH_TOKEN = "refresh token";
    public static final String TEST_SIGNED_URL = "signed url";
    public static final String TEST_URL_TO_SIGN = "url";
    public static final String TEST_URL_METHOD = "post";

    public static UnsignedUrlDTO getTestUrlToSign() {
        UnsignedUrlDTO unsignedUrlDTO = new UnsignedUrlDTO();
        unsignedUrlDTO.setUrl(TEST_URL_TO_SIGN);
        unsignedUrlDTO.setMethod(TEST_URL_METHOD);
        return unsignedUrlDTO;
    }

    public static SignedUrlDTO getTestSignedUrl() {
        SignedUrlDTO signedUrlDTO = new SignedUrlDTO();
        signedUrlDTO.setSignedUrl(TEST_SIGNED_URL);
        return signedUrlDTO;
    }

    public static AuthenticatedUser getAuthUser() {
        User user = getUserFromDAO();
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        user.getRoles().forEach(role -> authorities.add(new SimpleGrantedAuthority(role.getName())));
        return new AuthenticatedUser(user.getEmail(), user.getPassword(), authorities, user.getId());

    }

}
