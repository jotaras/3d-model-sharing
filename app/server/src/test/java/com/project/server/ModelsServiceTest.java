package com.project.server;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;

import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import com.project.server.dao.ModelDAO;
import com.project.server.services.ModelsService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.project.server.domain.Model;
import com.project.server.domain.Tag;
import com.project.server.dto.ModelDTO;
import com.project.server.dto.TagDTO;
import com.project.server.exceptions.ModelNotFoundException;
import com.project.server.security.AuthenticationFacade;

import static com.project.server.constants.Constants.*;
import static com.project.server.TestConstantsAndTemplates.*; 

@ExtendWith(MockitoExtension.class)
public class ModelsServiceTest {

    @InjectMocks
    ModelsService modelsService;

    @Mock
    ModelDAO modelDAO;

    @Mock
    AuthenticationFacade authenticationFacade;

   
    @Test
    public void testGetAllModels() {
        List<Model> models = new LinkedList<>();
        Model model = getModelFromDAO();
        models.add(model);
        when(modelDAO.getAllModels()).thenReturn(models);

        List<ModelDTO> modelsFromDAO = new LinkedList<>(modelsService.getAllModels());
        assertEquals(1, modelsFromDAO.size());
        assertEquals(modelsFromDAO.get(0).getDTOCreatedAt(), TEST_MODEL_CREATED_AT);
        assertEquals(modelsFromDAO.get(0).getDTOModelId(), TEST_MODEL_ID);
        verify(modelDAO, times(1)).getAllModels();
    }

    @Test
    public void testCreateModel() {
        Set<Tag> modelTags = getTestTagsForModel();
        when(modelDAO.createModel(any(Model.class))).thenReturn(getModelFromDAO());
        when(authenticationFacade.getAuthenticatedUserId()).thenReturn(TEST_ID);
        when(modelDAO.getTagsForModel(anyCollection())).thenReturn(modelTags);

        ModelDTO createdModel = modelsService.createNewModel(getModelFromRequest());

        assertEquals(createdModel.getDTOCreatedAt(), TEST_MODEL_CREATED_AT);
        assertEquals(createdModel.getDTOTags(), TEST_TAG_IDS);
        assertEquals(createdModel.getDTOCreatedBy(), TEST_ID);
        assertEquals(createdModel.getDTOUpdatedBy(), TEST_ID);
        verify(modelDAO, times(1)).createModel(any(Model.class));
    }
    

    @Test
    public void testUpdateModel() {
        ModelDTO modelDTO = getModelFromRequest();
        Model model = getModelFromDAO();
        Set<Tag> modelTags = getTestTagsForModel();

        when(authenticationFacade.getAuthenticatedUserId()).thenReturn(TEST_ID);
        when(modelDAO.updateModel(anyInt(), any(Model.class))).thenReturn(model);
        when(modelDAO.getTagsForModel(anyCollection())).thenReturn(modelTags);
        ModelDTO createdModel = modelsService.updateModel(1, modelDTO);

        assertEquals(createdModel.getDTOCreatedAt(), TEST_MODEL_CREATED_AT);
        assertEquals(createdModel.getDTOCreatedBy(), TEST_MODEL_CREATED_BY);
        verify(modelDAO, times(1)).updateModel(anyInt(), any(Model.class));
    }

    @Test
    public void testUpdateModelWhenModelDoesNotExist() {
        ModelDTO modelDTO = getModelFromRequest();

        when(authenticationFacade.getAuthenticatedUserId()).thenReturn(TEST_ID);
        when(modelDAO.updateModel(anyInt(), any(Model.class))).thenThrow(new ModelNotFoundException(MODEL_NOT_FOUND_ERROR_MESSAGE));

        Throwable thrown = assertThrows(ModelNotFoundException.class, () -> modelsService.updateModel(1, modelDTO));
        assertEquals(thrown.getMessage(), MODEL_NOT_FOUND_ERROR_MESSAGE);
    }

    @Test
    public void testDeleteModel() {
        doNothing().when(modelDAO).deleteModel(anyInt());
        modelsService.deleteModel(TEST_ID);

        verify(modelDAO, times(1)).deleteModel(TEST_ID);
    }

    @Test
    public void testGetAllTags() {
        List<Tag> tags = new LinkedList<>();

        Tag tag = new Tag();
        tag.setName(TEST_FIRST_TAG_NAME);
        tag.setTagId(TEST_FIRST_TAG_ID);

        tags.add(tag);

        when(modelDAO.getAllTags()).thenReturn(tags);
        List<Tag> tagsFromService = new LinkedList<>(modelDAO.getAllTags());

        assertEquals(1, tagsFromService.size());
        assertEquals(tagsFromService.get(0).getName(), TEST_FIRST_TAG_NAME);
        assertEquals(tagsFromService.get(0).getTagId(), TEST_FIRST_TAG_ID);
    }

    @Test
    public void testCreateTag() {
        TagDTO tagDTO = new TagDTO();
        tagDTO.setName(TEST_FIRST_TAG_NAME);

        Tag tag = new Tag();
        tag.setName(TEST_FIRST_TAG_NAME);
        tag.setTagId(TEST_FIRST_TAG_ID);

        when(modelDAO.createTag(anyString())).thenReturn(tag);
        TagDTO createdTag = modelsService.createTag(tagDTO);

        assertEquals(createdTag.getName(), TEST_FIRST_TAG_NAME);
    }

}
