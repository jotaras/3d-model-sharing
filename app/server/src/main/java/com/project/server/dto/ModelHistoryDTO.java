package com.project.server.dto;

import java.io.Serializable;
import java.util.Objects;


public class ModelHistoryDTO implements Serializable {

    private Integer modelHistoryId;
	private String fileKey;
	private Long createdAt;
	private Integer createdBy;


    public Integer getModelHistoryId() {
        return this.modelHistoryId;
    }

    public void setModelHistoryId(Integer modelHistoryId) {
        this.modelHistoryId = modelHistoryId;
    }

    public String getFileKey() {
        return this.fileKey;
    }

    public void setFileKey(String fileKey) {
        this.fileKey = fileKey;
    }

    public Long getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }


    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof ModelHistoryDTO)) {
            return false;
        }
        ModelHistoryDTO modelHistoryDTO = (ModelHistoryDTO) o;
        return Objects.equals(modelHistoryId, modelHistoryDTO.modelHistoryId) &&
            Objects.equals(fileKey, modelHistoryDTO.fileKey) &&
            Objects.equals(createdAt, modelHistoryDTO.createdAt) &&
            Objects.equals(createdBy, modelHistoryDTO.createdBy);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modelHistoryId, fileKey, createdAt, createdBy);
    }

}
