package com.project.server.domain;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.JoinColumn;


@Entity
@Table(name = "models")
public class Model {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_id")
    private Integer modelId;

    @Column(name = "name")
	private String name;

    @Column(name = "description")
	private String description;

    @Column(name = "file_key")
	private String fileKey;

    @Column(name = "preview_blob_key")
    private String previewBlobKey;

    @Column(name = "created_at")
	private Timestamp createdAt;

    @Column(name = "created_by")
	private Integer createdBy;

    @Column(name = "updated_at")
	private Timestamp updatedAt;

    @Column(name = "updated_by")
	private Integer updatedBy;

    @OneToMany(
        fetch = FetchType.LAZY,
        mappedBy = "model",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<ModelHistory> modelHistoryList = new LinkedList<>();

    @ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
		name = "model_tag",
		joinColumns = {@JoinColumn(name = "model_id")},	
		inverseJoinColumns = {@JoinColumn(name = "tag_id")}
	)
	private Set<Tag> tags = new HashSet<>();

    public Model() {}

    public Model(String name, String description, String fileKey, String previewBlobKey) {
        this.name = name;
        this.description = description;
        this.fileKey = fileKey;
        this.previewBlobKey = previewBlobKey;
    }

    public void addModelHistory(ModelHistory modelHistory) {
        modelHistoryList.add(modelHistory);
        modelHistory.setModel(this);
    }

    public void addTag(Tag tag) {
        tags.add(tag);
        tag.getModels().add(this);
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    public List<ModelHistory> getModelHistory() {
        return modelHistoryList;
    }

    public Integer getModelId() {
        return this.modelId;
    }

    public void setModelId(Integer modelId) {
        this.modelId = modelId;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileKey() {
        return this.fileKey;
    }

    public void setFileKey(String fileKey) {
        this.fileKey = fileKey;
    }

    public String getPreviewBlobKey() {
        return this.previewBlobKey;
    }

    public void setPreviewBlobKey(String previewBlobKey) {
        this.previewBlobKey = previewBlobKey;
    }

    public Timestamp getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    public Timestamp getUpdatedAt() {
        return this.updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getUpdatedBy() {
        return this.updatedBy;
    }

    public void setUpdatedBy(Integer updatedBy) {
        this.updatedBy = updatedBy;
    }


    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof Model)) {
            return false;
        }
        Model model = (Model) o;
        return Objects.equals(modelId, model.modelId) && 
            Objects.equals(name, model.name) && 
            Objects.equals(description, model.description) && 
            Objects.equals(fileKey, model.fileKey) && 
            Objects.equals(previewBlobKey, model.previewBlobKey) && 
            Objects.equals(createdAt, model.createdAt) && 
            Objects.equals(createdBy, model.createdBy) && 
            Objects.equals(updatedAt, model.updatedAt) && 
            Objects.equals(updatedBy, model.updatedBy);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modelId, name, description, fileKey, previewBlobKey, createdAt, createdBy, updatedAt, updatedBy);
    }

    @Override
    public String toString() {
        return "{" +
            " modelId='" + getModelId() + "'" +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", fileKey='" + getFileKey() + "'" +
            ", previewBlobKey='" + getPreviewBlobKey() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", createdBy='" + getCreatedBy() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            ", updatedBy='" + getUpdatedBy() + "'" +
            "}";
    }

}
