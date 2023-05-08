package com.project.server;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import org.hamcrest.Matchers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.server.controllers.ModelsController;
import com.project.server.dto.ModelDTO;
import com.project.server.exceptions.ModelNotFoundException;
import com.project.server.exceptions.TestException;
import com.project.server.security.JWTService;
import com.project.server.security.UserDetailsServiceImplementation;
import com.project.server.services.ModelsService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import static com.project.server.constants.Constants.*; 
import static com.project.server.constants.SystemConstants.*;
import static com.project.server.TestConstantsAndTemplates.*;

@ExtendWith(SpringExtension.class)
@WebMvcTest(ModelsController.class)
public class ModelsControllerTest {

    @MockBean
    ModelsService modelsService;

    @MockBean
    private UserDetailsServiceImplementation userDetailsServiceImplementation;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JWTService jwtService;

    @Autowired
    MockMvc mockMvc;


    @Test
    public void testGetAllModels() throws JsonProcessingException, TestException {
        ModelDTO modelFromService = getModelFromService();
        List<ModelDTO> models = new LinkedList<>();
        models.add(modelFromService);

        when(modelsService.getAllModels()).thenReturn(models);

        try {
            mockMvc.perform(get(MODELS_ROUTE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].name", Matchers.is(modelFromService.getDTOName())));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }

    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testCreateModel() throws JsonProcessingException, TestException {
        ModelDTO modelFromService = getModelFromService();
        ModelDTO modelToCreate = getModelFromRequest();
        when(modelsService.createNewModel(any(ModelDTO.class))).thenReturn(modelFromService);

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(modelToCreate);
        try {
            mockMvc.perform(post(MODELS_ROUTE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", Matchers.is(modelFromService.getDTOName())))
                .andExpect(jsonPath("$.tagIds", Matchers.containsInAnyOrder(modelFromService.getDTOTags().toArray())))
                .andExpect(jsonPath("$.createdAt", Matchers.is(modelFromService.getDTOCreatedAt())));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(modelsService, times(1)).createNewModel(any(ModelDTO.class));
    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testUpdateModel() throws JsonProcessingException, TestException {
        ModelDTO modelFromService = getModelFromService();
        Long modelUpdatedTime = System.currentTimeMillis();
        List<Integer> modelUpdatedTags = Arrays.asList(1, 2, 3);
        int modelUpdatedBy = 2;
        modelFromService.setDTOUpdatedAt(modelUpdatedTime);
        modelFromService.setDTOUpdatedBy(modelUpdatedBy);
        modelFromService.setDTOTags(new HashSet<>(modelUpdatedTags));
        ModelDTO modelToCreate = getModelFromRequest();

        when(modelsService.updateModel(anyInt(), any(ModelDTO.class))).thenReturn(modelFromService);

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(modelToCreate);
        try {
            mockMvc.perform(put(MODELS_ROUTE + "/" + TEST_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", Matchers.is(modelFromService.getDTOName())))
                .andExpect(jsonPath("$.updatedAt", Matchers.is(modelUpdatedTime)))
                .andExpect(jsonPath("$.updatedBy", Matchers.is(modelUpdatedBy)))
                .andExpect(jsonPath("$.tagIds", Matchers.is(modelUpdatedTags)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(modelsService, times(1)).updateModel(anyInt(), any(ModelDTO.class));

    }

    @Test
    @WithMockUser(authorities = "Admin")
    public void testDeleteModel() throws JsonProcessingException, TestException {
        doNothing().when(modelsService).deleteModel(anyInt());

        try {
            mockMvc.perform(delete(MODELS_ROUTE + "/" + TEST_ID))
                .andExpect(status().isOk());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(modelsService, times(1)).deleteModel(anyInt());
    }

    @Test()
    @WithMockUser(authorities = "Admin")
    public void testUpdateModelWhenModelNotFound() throws JsonProcessingException, TestException{
        ModelDTO modelToCreate = getModelFromRequest();

        when(modelsService.updateModel(anyInt(), any(ModelDTO.class))).thenThrow(ModelNotFoundException.class);

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(modelToCreate);
        try {
            mockMvc.perform(put(MODELS_ROUTE + "/" + TEST_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isNotFound());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
    }

    @Test()
    @WithMockUser(authorities = "Admin")
    public void testUpdateModelWhenInputNotValid() throws JsonProcessingException, TestException {
        ModelDTO modelToCreate = getModelFromRequest();
        ModelDTO modelFromService = getModelFromService();
        modelToCreate.setDTOName(null);
        when(modelsService.updateModel(anyInt(), any(ModelDTO.class))).thenReturn(modelFromService);

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(modelToCreate);
        try {
            mockMvc.perform(put(MODELS_ROUTE + "/" + TEST_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$", Matchers.containsString(MODEL_NAME_EMPTY_ERROR_MESSAGE)));
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
    }

    @Test
    public void testCreateModelWithoutAdminRole() throws JsonProcessingException, TestException {
        ModelDTO modelFromService = getModelFromService();
        ModelDTO modelToCreate = getModelFromRequest();
        when(modelsService.createNewModel(any(ModelDTO.class))).thenReturn(modelFromService);

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(modelToCreate);
        try {
            mockMvc.perform(post(MODELS_ROUTE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(modelsService, times(0)).createNewModel(any(ModelDTO.class));
    }

    @Test
    public void testUpdateModelWithoutAdminRole() throws JsonProcessingException, TestException {
        ModelDTO modelFromService = getModelFromService();
        ModelDTO modelToCreate = getModelFromRequest();

        when(modelsService.updateModel(anyInt(), any(ModelDTO.class))).thenReturn(modelFromService);

        ObjectMapper objectMapper = new ObjectMapper();

        String json = objectMapper.writeValueAsString(modelToCreate);
        try {
            mockMvc.perform(put(MODELS_ROUTE + "/" + TEST_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .characterEncoding(ENCODING))
                .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(modelsService, times(0)).updateModel(anyInt(), any(ModelDTO.class));

    }

    @Test
    public void testDeleteModelWithoutAdminRole() throws JsonProcessingException, TestException {
        doNothing().when(modelsService).deleteModel(anyInt());

        try {
            mockMvc.perform(delete(MODELS_ROUTE + "/" + TEST_ID))
                .andExpect(status().isForbidden());
        } catch (Exception e) {
            throw(new TestException(e.getMessage()));
        }
        verify(modelsService, times(0)).deleteModel(anyInt());
    }

}
