# 视频处理集成测试说明

## 概述

视频处理的集成测试需要实际的 FFmpeg 环境才能运行。这些测试会：
- 实际上传视频文件
- 实际转换视频为动画格式
- 验证文件系统集成
- 测试端到端的视频处理流程

## 运行要求

### 1. FFmpeg 环境

确保系统已安装 FFmpeg：

```bash
# macOS (使用 Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg

# 验证安装
ffmpeg -version
```

### 2. 环境变量

设置环境变量以启用集成测试：

```bash
export ENABLE_VIDEO_INTEGRATION_TESTS=true
```

### 3. 测试视频文件（可选）

对于需要真实视频文件的测试，可以在 `src/test/resources/` 目录下放置测试视频文件：
- `test-video.mp4` - 用于测试视频信息提取和转换

## 运行测试

### 运行所有集成测试

```bash
export ENABLE_VIDEO_INTEGRATION_TESTS=true
mvn test -Dtest=*IntegrationTest
```

### 运行视频控制器集成测试

```bash
export ENABLE_VIDEO_INTEGRATION_TESTS=true
mvn test -Dtest=VideoControllerIntegrationTest
```

### 运行视频处理服务集成测试

```bash
export ENABLE_VIDEO_INTEGRATION_TESTS=true
mvn test -Dtest=VideoProcessingServiceIntegrationTest
```

### 使用 Maven Profile（推荐）

在 `pom.xml` 中添加 profile：

```xml
<profiles>
    <profile>
        <id>integration-tests</id>
        <properties>
            <enable.video.integration.tests>true</enable.video.integration.tests>
        </properties>
        <activation>
            <property>
                <name>enable.video.integration.tests</name>
                <value>true</value>
            </property>
        </activation>
    </profile>
</profiles>
```

然后运行：

```bash
mvn test -Pintegration-tests -Dtest=*IntegrationTest
```

## 测试说明

### VideoControllerIntegrationTest

- `testListVideos_EmptyList` - 测试空视频列表
- `testListVideos_WithCategory` - 测试按分类列表
- `testEndToEnd_VideoUploadAndList` - 端到端测试（上传->列表）
- `testConvertToGif_EndToEnd` - 端到端转换测试（需要真实视频文件）
- `testFileSystemIntegration` - 文件系统集成测试

### VideoProcessingServiceIntegrationTest

- `testValidateVideoFormat_ValidFormats` - 验证视频格式（不需要真实文件）
- `testGetVideoInfo_WithRealVideo` - 提取视频信息（需要真实视频文件）
- `testConvertToGif_WithRealVideo` - 转换为GIF（需要真实视频文件）
- `testConvertToLottie_Unsupported` - 验证Lottie未实现
- `testConvertToPag_Unsupported` - 验证PAG未实现

## 注意事项

1. **FFmpeg 不可用时的行为**
   - 测试会检查 FFmpeg 是否可用
   - 如果不可用，相关测试会被跳过
   - 不会导致测试失败

2. **测试数据清理**
   - 测试使用临时目录存储测试文件
   - 测试结束后会自动清理（使用 `@Transactional` 和临时目录）

3. **性能考虑**
   - 视频转换测试可能需要较长时间
   - 建议在 CI/CD 中单独运行
   - 可以使用较小的测试视频文件

4. **数据库要求**
   - 集成测试需要 MySQL 数据库
   - 使用 `integration-test` profile
   - 数据库会自动创建和清理（`ddl-auto: create-drop`）

## CI/CD 配置示例

### GitHub Actions

```yaml
- name: Install FFmpeg
  run: |
    sudo apt-get update
    sudo apt-get install -y ffmpeg

- name: Run Video Integration Tests
  env:
    ENABLE_VIDEO_INTEGRATION_TESTS: true
  run: |
    mvn test -Dtest=*IntegrationTest
```

### Jenkins

```groovy
stage('Integration Tests') {
    steps {
        sh '''
            sudo apt-get update
            sudo apt-get install -y ffmpeg
            export ENABLE_VIDEO_INTEGRATION_TESTS=true
            mvn test -Dtest=*IntegrationTest
        '''
    }
}
```

## 故障排除

### 测试被跳过

如果测试被跳过，检查：
1. 环境变量 `ENABLE_VIDEO_INTEGRATION_TESTS` 是否设置为 `true`
2. FFmpeg 是否已安装并可用
3. 测试类上的 `@EnabledIfEnvironmentVariable` 注解

### FFmpeg 不可用错误

如果看到 FFmpeg 相关错误：
1. 检查 FFmpeg 安装：`ffmpeg -version`
2. 检查 Java 进程是否可以访问 FFmpeg
3. 检查 JAVE 库依赖是否正确

### 数据库连接错误

如果看到数据库错误：
1. 检查 `application-integration-test.yml` 配置
2. 确保 MySQL 服务正在运行
3. 检查数据库连接参数

## 测试覆盖率

集成测试主要覆盖：
- ✅ API 端点集成
- ✅ 文件系统操作
- ✅ 视频格式验证
- ✅ 错误处理流程
- ⚠️ 视频转换（需要真实文件和FFmpeg）

单元测试（不需要 FFmpeg）覆盖：
- ✅ 格式验证逻辑
- ✅ 参数验证
- ✅ 错误处理
- ✅ 枚举和配置类
