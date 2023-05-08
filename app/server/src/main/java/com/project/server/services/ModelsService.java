package com.project.server.services;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.server.dao.ModelDAO;
import com.project.server.domain.Model;
import com.project.server.domain.ModelHistory;
import com.project.server.domain.Tag;
import com.project.server.dto.ModelDTO;
import com.project.server.dto.ModelHistoryDTO;
import com.project.server.dto.TagDTO;
import com.project.server.security.AuthenticationFacade;

@Service
public class ModelsService {

    @Autowired
    private ModelDAO modelDAO;

    @Autowired
    private AuthenticationFacade authenticationFacade;


    public Collection<ModelDTO> getAllModels() {
        return modelDAO.getAllModels()
            .stream()
            .map(model -> modelToModelDTO(model))
            .collect(Collectors.toList());
    }

    public ModelDTO getModel(Integer modelId) {
        Model model = modelDAO.getModel(modelId);
        return modelToModelDTO(model);
    }

    public ModelDTO createNewModel(ModelDTO modelDTO) {
        Model modelToCreate = modelDTOToModel(modelDTO);
        Timestamp date = new Timestamp(System.currentTimeMillis());
        Integer authenticatedUserId = authenticationFacade.getAuthenticatedUserId();
        modelToCreate.setCreatedBy(authenticatedUserId);
        modelToCreate.setCreatedAt(date);
        modelToCreate.setUpdatedBy(authenticatedUserId);
        modelToCreate.setUpdatedAt(date);
        modelToCreate.setTags(modelDAO.getTagsForModel(modelDTO.getDTOTags()));

        Model createdModel = modelDAO.createModel(modelToCreate);
        return modelToModelDTO(createdModel);
    }

    public ModelDTO updateModel(Integer modelId, ModelDTO modelDTO) {
        Model modelToUpdate = modelDTOToModel(modelDTO);
        Timestamp date = new Timestamp(System.currentTimeMillis());
        modelToUpdate.setUpdatedAt(date);
        modelToUpdate.setUpdatedBy(authenticationFacade.getAuthenticatedUserId());
        modelToUpdate.setTags(modelDAO.getTagsForModel(modelDTO.getDTOTags()));
        Model updatedModel = modelDAO.updateModel(modelId, modelToUpdate);

        return modelToModelDTO(updatedModel);
    }

    public void deleteModel(Integer modelId) {
        modelDAO.deleteModel(modelId);
    }

    public Collection<ModelHistoryDTO> getModelHistory(Integer modelId) {
        return modelDAO.getModelHistory(modelId)
            .stream()
            .map(modelHistory -> modelToModelHistoryDTO(modelHistory))
            .collect(Collectors.toList());
    }

    public Collection<TagDTO> getAllTags() {
        return modelDAO.getAllTags()
            .stream()
            .map(tag -> tagToTagDTO(tag))
            .collect(Collectors.toList());
    }

    public TagDTO createTag(TagDTO tagDTO) {
        Tag newTag = modelDAO.createTag(tagDTO.getName());
        return tagToTagDTO(newTag);
    }

    private ModelDTO modelToModelDTO(Model model) {
        ModelDTO modelDTO = new ModelDTO();
        modelDTO.setDTOModelId(model.getModelId());
        modelDTO.setDTOName(model.getName());
        modelDTO.setDTODescription(model.getDescription());
        modelDTO.setDTOFileKey(model.getFileKey());
        modelDTO.setDTOPreviewBlobKey(model.getPreviewBlobKey());
        modelDTO.setDTOCreatedAt(model.getCreatedAt().getTime());
        modelDTO.setDTOCreatedBy(model.getCreatedBy());
        modelDTO.setDTOUpdatedAt(model.getUpdatedAt().getTime());
        modelDTO.setDTOUpdatedBy(model.getUpdatedBy());
        modelDTO.setDTOTags(model.getTags().stream().map(tag -> tag.getTagId()).collect(Collectors.toSet()));
        return modelDTO;
    }

    private Model modelDTOToModel(ModelDTO modelDTO) {
        Model model = new Model();
        model.setName(modelDTO.getDTOName());
        model.setDescription(modelDTO.getDTODescription());
        model.setFileKey(modelDTO.getDTOFileKey());
        model.setPreviewBlobKey(modelDTO.getDTOPreviewBlobKey());
        return model;
    }

    private ModelHistoryDTO modelToModelHistoryDTO(ModelHistory modelHistory) {
        ModelHistoryDTO modelHistoryDTO = new ModelHistoryDTO();
        modelHistoryDTO.setModelHistoryId(modelHistory.getModelHistoryId());
        modelHistoryDTO.setFileKey(modelHistory.getFileKey());
        modelHistoryDTO.setCreatedAt(modelHistory.getCreatedAt().getTime());
        modelHistoryDTO.setCreatedBy(modelHistory.getCreatedBy());
        return modelHistoryDTO;
    }

    private TagDTO tagToTagDTO(Tag tag) {
        TagDTO tagDTO = new TagDTO();
        tagDTO.setTagId(tag.getTagId());
        tagDTO.setName(tag.getName());
        return tagDTO;
    }
    
}
