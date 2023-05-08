package com.project.server.dto;

import java.io.Serializable;
import java.util.Objects;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Null;
import javax.validation.constraints.Size;

import static com.project.server.constants.Constants.*;

public class TagDTO implements Serializable{

    @Null
    private Integer tagId;

    @NotBlank(message = TAG_NAME_EMPTY_ERROR_MESSAGE)
    @Size(max = 15, message = TAG_SIZE_ERROR_MESSAGE)
    private String name;

    public Integer getTagId() {
        return this.tagId;
    }

    public void setTagId(Integer tagId) {
        this.tagId = tagId;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof TagDTO)) {
            return false;
        }
        TagDTO tagDTO = (TagDTO) o;
        return Objects.equals(tagId, tagDTO.tagId) && Objects.equals(name, tagDTO.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tagId, name);
    }

    @Override
    public String toString() {
        return "{" +
            " tagId='" + getTagId() + "'" +
            ", name='" + getName() + "'" +
            "}";
    }
    
}
