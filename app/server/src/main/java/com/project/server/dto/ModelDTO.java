package com.project.server.dto;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Null;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonProperty;

import static com.project.server.constants.Constants.*;

public class ModelDTO implements Serializable {
    
    @Null
    private Integer modelId;

    @NotBlank(message = MODEL_NAME_EMPTY_ERROR_MESSAGE)
    @Size(max = 40, message = MODEL_NAME_SIZE_ERROR_MESSAGE)
    private String name;

    @NotBlank(message = MODEL_DESC_EMPTY_ERROR_MESSAGE)
    @Size(max = 500, message = MODEL_DESC_SIZE_ERROR_MESSAGE)
    private String description;

    @Size(max = 40, message = MODEL_FILE_KEY_SIZE_ERROR_MESSAGE)
    private String fileKey;

    @Size(max = 40, message = MODEL_PREVIEW_KEY_SIZE_ERROR_MESSAGE)
    private String previewBlobKey;

    @Null
	private Long createdAt;

    @Null
	private Integer createdBy;

    @Null
	private Long updatedAt;

    @Null
	private Integer updatedBy;

    private Set<Integer> tags = new HashSet<>();

    @JsonProperty("modelId")
    public Integer getDTOModelId() {
        return this.modelId;
    }

    @JsonProperty("modelId")
    public void setDTOModelId(Integer modelId) {
        this.modelId = modelId;
    }

    @JsonProperty("name")
    public String getDTOName() {
        return this.name;
    }

    @JsonProperty("name")
    public void setDTOName(String name) {
        this.name = name;
    }

    @JsonProperty("description")
    public String getDTODescription() {
        return this.description;
    }

    @JsonProperty("description")
    public void setDTODescription(String description) {
        this.description = description;
    }

    @JsonProperty("fileKey")
    public String getDTOFileKey() {
        return this.fileKey;
    }

    @JsonProperty("fileKey")
    public void setDTOFileKey(String fileKey) {
        this.fileKey = fileKey;
    }

    @JsonProperty("previewBlobKey")
    public String getDTOPreviewBlobKey() {
        return this.previewBlobKey;
    }

    @JsonProperty("previewBlobKey")
    public void setDTOPreviewBlobKey(String previewBlobKey) {
        this.previewBlobKey = previewBlobKey;
    }

    @JsonProperty("createdAt")
    public Long getDTOCreatedAt() {
        return this.createdAt;
    }

    @JsonProperty("createdAt")
    public void setDTOCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    @JsonProperty("createdBy")
    public Integer getDTOCreatedBy() {
        return this.createdBy;
    }

    @JsonProperty("createdBy")
    public void setDTOCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    @JsonProperty("updatedAt")
    public Long getDTOUpdatedAt() {
        return this.updatedAt;
    }

    @JsonProperty("updatedAt")
    public void setDTOUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }

    @JsonProperty("updatedBy")
    public Integer getDTOUpdatedBy() {
        return this.updatedBy;
    }

    @JsonProperty("updatedBy")
    public void setDTOUpdatedBy(Integer updatedBy) {
        this.updatedBy = updatedBy;
    }

    @JsonProperty("tagIds")
    public Set<Integer> getDTOTags() {
        return this.tags;
    }

    @JsonProperty("tagIds")
    public void setDTOTags(Set<Integer> tags) {
        this.tags = tags;
    }


    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof ModelDTO)) {
            return false;
        }
        ModelDTO modelDTO = (ModelDTO) o;
        return Objects.equals(modelId, modelDTO.modelId) &&
            Objects.equals(name, modelDTO.name) &&
            Objects.equals(description, modelDTO.description) &&
            Objects.equals(fileKey, modelDTO.fileKey) && 
            Objects.equals(previewBlobKey, modelDTO.previewBlobKey) && 
            Objects.equals(createdAt, modelDTO.createdAt) && 
            Objects.equals(createdBy, modelDTO.createdBy) && 
            Objects.equals(updatedAt, modelDTO.updatedAt) && 
            Objects.equals(updatedBy, modelDTO.updatedBy);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modelId, name, description, fileKey, previewBlobKey, createdAt, createdBy, updatedAt, updatedBy);
    }

    @Override
    public String toString() {
        return "{" +
            " modelId='" + getDTOModelId() + "'" +
            ", name='" + getDTOName() + "'" +
            ", description='" + getDTODescription() + "'" +
            ", fileKey='" + getDTOFileKey() + "'" +
            ", previewBlobKey='" + getDTOPreviewBlobKey() + "'" +
            ", createdAt='" + getDTOCreatedAt() + "'" +
            ", createdBy='" + getDTOCreatedBy() + "'" +
            ", updatedAt='" + getDTOUpdatedAt() + "'" +
            ", updatedBy='" + getDTOUpdatedBy() + "'" +
            "}";
    }
    
    
}
