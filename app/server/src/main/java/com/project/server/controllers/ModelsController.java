package com.project.server.controllers;

import java.util.Collection;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.server.dto.ModelDTO;
import com.project.server.dto.ModelHistoryDTO;
import com.project.server.dto.TagDTO;
import com.project.server.services.ModelsService;
import static com.project.server.constants.SystemConstants.*;

@RestController()
@RequestMapping(MODELS_ROUTE)
public class ModelsController {
    
    @Autowired
    private ModelsService modelsService;

    @GetMapping()
    public Collection<ModelDTO> getAllModels() {
        return modelsService.getAllModels();
    }

    @GetMapping("/{id}")
    public ModelDTO getModel(@PathVariable Integer id) {
        return modelsService.getModel(id);
    }

    @PreAuthorize("hasAnyAuthority('Admin', 'User')")   
    @PostMapping()
    public ModelDTO createModel(@Valid @RequestBody ModelDTO modelDTO) {
        return modelsService.createNewModel(modelDTO);
    }

    @PreAuthorize("hasAnyAuthority('Admin', 'User')")   
    @PutMapping("/{id}")
    public ModelDTO updateModel(@Valid @RequestBody ModelDTO modelDTO, @PathVariable Integer id) {
        return modelsService.updateModel(id, modelDTO);
    }

    @GetMapping("/{id}/history")
    public Collection<ModelHistoryDTO> getModelHistory(@PathVariable Integer id) {
        return modelsService.getModelHistory(id);
    }

    @PreAuthorize("hasAnyAuthority('Admin', 'User')")  
    @DeleteMapping("/{id}")
    public void deleteModel(@PathVariable Integer id) {
        modelsService.deleteModel(id);
    }

    @GetMapping("/tags")
    public Collection<TagDTO> getAllTags() {
        return modelsService.getAllTags();
    }

    @PreAuthorize("hasAnyAuthority('Admin', 'User')")  
    @PostMapping("/tags")
    public TagDTO createTag(@Valid @RequestBody TagDTO tagDTO) {
        return modelsService.createTag(tagDTO);
    }

}
