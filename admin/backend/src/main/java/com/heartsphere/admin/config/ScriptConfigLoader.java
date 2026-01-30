package com.heartsphere.admin.config;

import com.heartsphere.admin.dto.ScriptInfoDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 脚本配置加载器
 */
@Component
public class ScriptConfigLoader {
    
    private static final Logger logger = LoggerFactory.getLogger(ScriptConfigLoader.class);
    
    private Map<String, ScriptInfoDTO> scripts = new HashMap<>();
    
    @PostConstruct
    public void loadScripts() {
        try {
            ClassPathResource resource = new ClassPathResource("scripts/scripts-config.yml");
            InputStream inputStream = resource.getInputStream();
            
            ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
            Map<String, Object> config = mapper.readValue(inputStream, Map.class);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> scriptsList = (List<Map<String, Object>>) config.get("scripts");
            
            if (scriptsList != null) {
                for (Map<String, Object> scriptMap : scriptsList) {
                    ScriptInfoDTO script = mapToScriptInfo(scriptMap);
                    scripts.put(script.getId(), script);
                }
            }
            
            logger.info("Loaded {} scripts from configuration", scripts.size());
        } catch (Exception e) {
            logger.error("Failed to load script configuration", e);
        }
    }
    
    private ScriptInfoDTO mapToScriptInfo(Map<String, Object> map) {
        ScriptInfoDTO script = new ScriptInfoDTO();
        script.setId((String) map.get("id"));
        script.setName((String) map.get("name"));
        script.setCategory((String) map.get("category"));
        script.setDescription((String) map.get("description"));
        script.setScript((String) map.get("script"));
        script.setType((String) map.get("type"));
        
        if (map.get("timeout") != null) {
            script.setTimeout(((Number) map.get("timeout")).intValue());
        }
        
        if (map.get("requires") != null) {
            @SuppressWarnings("unchecked")
            List<String> requires = (List<String>) map.get("requires");
            script.setRequires(requires);
        }
        
        if (map.get("parameters") != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> params = (List<Map<String, Object>>) map.get("parameters");
            List<ScriptInfoDTO.ScriptParameter> parameters = params.stream()
                    .map(this::mapToParameter)
                    .collect(Collectors.toList());
            script.setParameters(parameters);
        }
        
        if (map.get("permissions") != null) {
            @SuppressWarnings("unchecked")
            List<String> permissions = (List<String>) map.get("permissions");
            script.setPermissions(permissions);
        }
        
        if (map.get("environments") != null) {
            @SuppressWarnings("unchecked")
            List<String> environments = (List<String>) map.get("environments");
            script.setEnvironments(environments);
        }
        
        if (map.get("confirmRequired") != null) {
            script.setConfirmRequired((Boolean) map.get("confirmRequired"));
        }
        
        script.setRiskLevel((String) map.get("riskLevel"));
        
        return script;
    }
    
    private ScriptInfoDTO.ScriptParameter mapToParameter(Map<String, Object> map) {
        ScriptInfoDTO.ScriptParameter param = new ScriptInfoDTO.ScriptParameter();
        param.setName((String) map.get("name"));
        param.setType((String) map.get("type"));
        param.setDefaultValue(map.get("default"));
        param.setRequired(map.get("required") != null ? (Boolean) map.get("required") : false);
        param.setDescription((String) map.get("description"));
        
        if (map.get("values") != null) {
            @SuppressWarnings("unchecked")
            List<String> values = (List<String>) map.get("values");
            param.setValues(values);
        }
        
        return param;
    }
    
    public List<ScriptInfoDTO> getAllScripts() {
        return new ArrayList<>(scripts.values());
    }
    
    public ScriptInfoDTO getScript(String scriptId) {
        return scripts.get(scriptId);
    }
    
    public List<ScriptInfoDTO> getScriptsByCategory(String category) {
        return scripts.values().stream()
                .filter(s -> category.equals(s.getCategory()))
                .collect(Collectors.toList());
    }
}
