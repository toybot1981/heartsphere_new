#!/bin/bash
# 代码生成工具

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../build/common.sh"

TEMPLATES_DIR="$SCRIPT_DIR/templates"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}代码生成工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查参数
if [ $# -lt 2 ]; then
    echo "用法: $0 <type> <name> [options]"
    echo ""
    echo "类型 (type):"
    echo "  controller  - Spring Boot Controller"
    echo "  service     - Spring Boot Service"
    echo "  repository  - Spring Data JPA Repository"
    echo "  entity      - JPA Entity"
    echo "  dto         - DTO 类"
    echo ""
    echo "示例:"
    echo "  $0 controller UserController"
    echo "  $0 service UserService"
    echo "  $0 entity User"
    echo ""
    exit 1
fi

type=$1
name=$2
package=${3:-"com.heartsphere"}

# 转换为包路径
package_path=$(echo "$package" | tr '.' '/')

# 确定目标目录（简化版，默认使用 main/backend）
TARGET_DIR="$PROJECT_ROOT/main/backend/src/main/java/$package_path"

echo -e "${YELLOW}生成代码:${NC}"
echo -e "  类型: $type"
echo -e "  名称: $name"
echo -e "  包名: $package"
echo -e "  目标: $TARGET_DIR"
echo ""

# 创建目标目录
mkdir -p "$TARGET_DIR"

# 生成代码（简化版实现）
case $type in
    controller)
        class_name="${name}Controller"
        file_path="$TARGET_DIR/${class_name}.java"
        
        cat > "$file_path" << EOF
package $package;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.RequiredArgsConstructor;

/**
 * ${name} Controller
 * 
 * @author HeartSphere
 * @version 1.0
 */
@RestController
@RequestMapping("/api/v1/${name,,}")
@RequiredArgsConstructor
public class ${class_name} {
    
    // TODO: 注入 Service
    
    @GetMapping
    public String list() {
        // TODO: 实现列表查询
        return "List ${name}";
    }
    
    @GetMapping("/{id}")
    public String get(@PathVariable Long id) {
        // TODO: 实现详情查询
        return "Get ${name} " + id;
    }
    
    @PostMapping
    public String create(@RequestBody Object request) {
        // TODO: 实现创建
        return "Create ${name}";
    }
    
    @PutMapping("/{id}")
    public String update(@PathVariable Long id, @RequestBody Object request) {
        // TODO: 实现更新
        return "Update ${name} " + id;
    }
    
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        // TODO: 实现删除
        return "Delete ${name} " + id;
    }
}
EOF
        echo -e "${GREEN}✓ Controller 已生成: $file_path${NC}"
        ;;
        
    service)
        class_name="${name}Service"
        interface_name="I${class_name}"
        file_path="$TARGET_DIR/${class_name}.java"
        
        cat > "$file_path" << EOF
package $package;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

/**
 * ${name} Service
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class ${class_name} implements ${interface_name} {
    
    // TODO: 注入 Repository
    
    // TODO: 实现业务逻辑
}
EOF
        
        # 生成接口
        interface_path="$TARGET_DIR/${interface_name}.java"
        cat > "$interface_path" << EOF
package $package;

/**
 * ${name} Service Interface
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ${interface_name} {
    // TODO: 定义接口方法
}
EOF
        
        echo -e "${GREEN}✓ Service 已生成: $file_path${NC}"
        echo -e "${GREEN}✓ Interface 已生成: $interface_path${NC}"
        ;;
        
    repository)
        class_name="${name}Repository"
        entity_name=$(echo "$name" | sed 's/Repository$//')
        file_path="$TARGET_DIR/${class_name}.java"
        
        cat > "$file_path" << EOF
package $package;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * ${name} Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface ${class_name} extends JpaRepository<${entity_name}, Long> {
    // TODO: 添加自定义查询方法
}
EOF
        echo -e "${GREEN}✓ Repository 已生成: $file_path${NC}"
        ;;
        
    entity)
        class_name="$name"
        file_path="$TARGET_DIR/${class_name}.java"
        
        cat > "$file_path" << EOF
package $package;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ${name} Entity
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "${name,,}s")
@Data
public class ${class_name} {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // TODO: 添加字段
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
EOF
        echo -e "${GREEN}✓ Entity 已生成: $file_path${NC}"
        ;;
        
    dto)
        class_name="${name}DTO"
        file_path="$TARGET_DIR/${class_name}.java"
        
        cat > "$file_path" << EOF
package $package;

import lombok.Data;

/**
 * ${name} DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class ${class_name} {
    // TODO: 添加字段
}
EOF
        echo -e "${GREEN}✓ DTO 已生成: $file_path${NC}"
        ;;
        
    *)
        echo -e "${RED}错误: 未知的类型: $type${NC}"
        echo "支持的类型: controller, service, repository, entity, dto"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}代码生成完成！${NC}"
echo -e "${YELLOW}提示: 请检查生成的代码并根据需要修改${NC}"
