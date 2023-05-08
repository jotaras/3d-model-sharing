package com.project.server.domain;

import java.sql.Timestamp;
import java.util.Objects;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;


@Entity
@Table(name = "model_history")
public class ModelHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_history_id")
    private Integer modelHistoryId;

    @Column(name = "file_key")
	private String fileKey;

    @Column(name = "created_at")
	private Timestamp createdAt;

    @Column(name = "created_by")
	private Integer createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id")
    private Model model;
    

    public ModelHistory() {}

    public ModelHistory(String fileKey, Timestamp createdAt, Integer createdBy) {
        this.fileKey = fileKey;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }

    public void setModel(Model model) {
        this.model = model;
    }

    public Integer getModelHistoryId() {
        return this.modelHistoryId;
    }

    public String getFileKey() {
        return this.fileKey;
    }

    public void setFileKey(String fileKey) {
        this.fileKey = fileKey;
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

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof ModelHistory)) {
            return false;
        }
        ModelHistory modelHistory = (ModelHistory) o;
        return Objects.equals(modelHistoryId, modelHistory.modelHistoryId) && Objects.equals(fileKey, modelHistory.fileKey) && Objects.equals(createdAt, modelHistory.createdAt) && Objects.equals(createdBy, modelHistory.createdBy);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modelHistoryId, fileKey, createdAt, createdBy);
    }

    @Override
    public String toString() {
        return "{" +
            " modelHistoryId='" + getModelHistoryId() + "'" +
            ", fileKey='" + getFileKey() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", createdBy='" + getCreatedBy() + "'" +
            "}";
    }

}
