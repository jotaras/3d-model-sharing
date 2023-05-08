package com.project.server.dao;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.project.server.domain.Model;
import com.project.server.domain.ModelHistory;
import com.project.server.domain.Tag;
import com.project.server.exceptions.ModelNotFoundException;
import com.project.server.exceptions.TagsDoNotExistException;

import static com.project.server.constants.Constants.*;

@Repository
public class ModelDAO {
    
    @PersistenceContext
    EntityManager entityManager;

    public List<Model> getAllModels() {
        TypedQuery<Model> getModelsQuery = entityManager.createQuery("SELECT m FROM Model m", Model.class);
        return getModelsQuery.getResultList();
    }

    public Model getModel(Integer modelId) {
        Model model = entityManager.find(Model.class, modelId);
        if (Objects.isNull(model)) {
            throw new ModelNotFoundException(MODEL_NOT_FOUND_ERROR_MESSAGE);
        }
        return model;
    }

    public List<ModelHistory> getModelHistory(Integer modelId) {
        Model model = entityManager.find(Model.class, modelId);

        if (Objects.isNull(model)) {
            throw new ModelNotFoundException(MODEL_NOT_FOUND_ERROR_MESSAGE);
        }

        return model.getModelHistory();
    }

    public List<Tag> getAllTags() {
        TypedQuery<Tag> getTagsQuery = entityManager.createQuery("SELECT t FROM Tag t", Tag.class);
        return getTagsQuery.getResultList();
    }

    @Transactional
    public Model createModel(Model model) {
        entityManager.persist(model);
        return model;
    }

    @Transactional
    public Model updateModel(Integer modelId, Model model) {
        Model updatedModel = entityManager.find(Model.class, modelId);

        if (Objects.isNull(updatedModel)) {
            throw new ModelNotFoundException(MODEL_NOT_FOUND_ERROR_MESSAGE);
        }

        ModelHistory modelHistory = new ModelHistory(updatedModel.getFileKey(), updatedModel.getUpdatedAt(), updatedModel.getUpdatedBy());
    
        updatedModel.setName(model.getName());
        updatedModel.setDescription(model.getDescription());
        updatedModel.setFileKey(model.getFileKey());
        updatedModel.setPreviewBlobKey(model.getPreviewBlobKey());
        updatedModel.setUpdatedAt(model.getUpdatedAt());
        updatedModel.setUpdatedBy(model.getUpdatedBy());
        updatedModel.addModelHistory(modelHistory);
        updatedModel.setTags(model.getTags());

        entityManager.persist(updatedModel);
        return updatedModel;
    }

    @Transactional
    public void deleteModel(Integer modelId) {
        Model model = entityManager.find(Model.class, modelId);
        if (Objects.isNull(model)) {
            throw new ModelNotFoundException(MODEL_NOT_FOUND_ERROR_MESSAGE);
        }
        entityManager.remove(model);
    }

    @Transactional
    public Tag createTag(String tagName) {
        TypedQuery<Tag> getTagQuery = entityManager.createQuery("SELECT t FROM Tag t Where t.name = :nameParam", Tag.class);
        getTagQuery.setParameter("nameParam", tagName);

        Tag tag;
        try {
            tag = getTagQuery.getSingleResult();
        } catch (NoResultException noResultException) {
            tag = new Tag(tagName);
            entityManager.persist(tag);
        }
        return tag;
    }

    public Set<Tag> getTagsForModel(Collection<Integer> tagIds) {
        Set<Tag> newTags = new HashSet<>(); 
        List<Integer> tagsThatDoNotExist = new LinkedList<>();

        for (Integer tagId: tagIds) {

            Tag tag = entityManager.find(Tag.class, tagId);
            if (Objects.isNull(tag)) {
                tagsThatDoNotExist.add(tagId);
                continue;
            }
            newTags.add(tag);
        }

        if (!tagsThatDoNotExist.isEmpty()) {
            throw new TagsDoNotExistException(TAGS_DO_NOT_EXIST_ERROR_MESSAGE + tagsThatDoNotExist);
        }
        
        return newTags;
    }
}
