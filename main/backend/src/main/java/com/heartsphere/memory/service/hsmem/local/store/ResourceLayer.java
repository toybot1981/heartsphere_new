package com.heartsphere.memory.service.hsmem.local.store;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 资源层 - 存储原始多模态数据，与 HSMem Python ResourceLayer 行为一致。
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ResourceLayer {

    private final ObjectMapper objectMapper;

    /**
     * 存储资源
     *
     * @param basePath    存储根路径（resources 父目录）
     * @param resourceData 资源数据
     * @param modality   模态类型（conversation/text/document）
     * @return 资源ID
     */
    public String store(Path basePath, Map<String, Object> resourceData, String modality) throws Exception {
        String resourceId = UUID.randomUUID().toString();
        Path modalityPath = basePath.resolve(modality);
        Files.createDirectories(modalityPath);

        Map<String, Object> resource = new LinkedHashMap<>();
        resource.put("id", resourceId);
        resource.put("modality", modality);
        resource.put("data", resourceData);
        resource.put("created_at", Instant.now().toString());
        resource.put("metadata", Map.of("size", resourceData.toString().length()));

        Path filePath = modalityPath.resolve(resourceId + ".json");
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), resource);
        return resourceId;
    }

    /**
     * 获取资源
     */
    public Optional<Map<String, Object>> get(Path basePath, String resourceId) {
        try {
            if (!Files.isDirectory(basePath)) return Optional.empty();
            try (Stream<Path> stream = Files.list(basePath)) {
                List<Path> dirs = stream.filter(Files::isDirectory).collect(Collectors.toList());
                for (Path modalityDir : dirs) {
                    Path filePath = modalityDir.resolve(resourceId + ".json");
                    if (Files.exists(filePath)) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> resource = objectMapper.readValue(filePath.toFile(), Map.class);
                        return Optional.of(resource);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("ResourceLayer.get failed: resourceId={}", resourceId, e);
        }
        return Optional.empty();
    }

    /**
     * 获取所有资源
     */
    public List<Map<String, Object>> getAll(Path basePath) {
        List<Map<String, Object>> results = new ArrayList<>();
        try {
            if (!Files.isDirectory(basePath)) return results;
            try (Stream<Path> stream = Files.list(basePath)) {
                List<Path> dirs = stream.filter(Files::isDirectory).collect(Collectors.toList());
                for (Path modalityDir : dirs) {
                    try (Stream<Path> files = Files.list(modalityDir)) {
                        files.filter(p -> p.getFileName().toString().endsWith(".json"))
                                .forEach(f -> {
                                    try {
                                        @SuppressWarnings("unchecked")
                                        Map<String, Object> resource = objectMapper.readValue(f.toFile(), Map.class);
                                        results.add(resource);
                                    } catch (Exception e) {
                                        log.warn("ResourceLayer.getAll read failed: {}", f, e);
                                    }
                                });
                    }
                }
            }
        } catch (Exception e) {
            log.warn("ResourceLayer.getAll failed", e);
        }
        return results;
    }

    public int count(Path basePath) {
        int[] count = {0};
        try {
            if (!Files.isDirectory(basePath)) return 0;
            try (Stream<Path> stream = Files.list(basePath)) {
                stream.filter(Files::isDirectory).forEach(modalityDir -> {
                    try (Stream<Path> files = Files.list(modalityDir)) {
                        count[0] += (int) files.filter(p -> p.getFileName().toString().endsWith(".json")).count();
                    } catch (Exception e) {
                        log.warn("ResourceLayer.count dir failed: {}", modalityDir, e);
                    }
                });
            }
        } catch (Exception e) {
            log.warn("ResourceLayer.count failed", e);
        }
        return count[0];
    }
}
