# Kuikly 迁移指南

## 概述

本文档描述如何将现有的 React/TypeScript Mobile 版本迁移到基于 Kotlin MultiPlatform (KMP) 的 Kuikly 框架。

## 当前架构分析

### 现有技术栈
- **前端框架**: React 19.2.0 + TypeScript
- **构建工具**: Vite 5.0
- **状态管理**: React Hooks (useState, useEffect)
- **API 通信**: RESTful API (fetch/axios)
- **本地存储**: localStorage
- **UI 组件**: 自定义 React 组件

### 核心功能模块
1. **用户认证** (LoginModal)
2. **场景管理** (MobileSceneSelection, EraConstructorModal)
3. **角色管理** (MobileCharacterSelection, CharacterConstructorModal)
4. **聊天对话** (ChatWindow)
5. **日记系统** (MobileRealWorld)
6. **剧本系统** (MobileScenarioBuilder)
7. **用户资料** (UserProfile)
8. **数据同步** (syncService)

## 迁移策略

### 阶段一：项目初始化

#### 1.1 创建 Kuikly 项目结构

```kotlin
heartsphere-mobile-kmp/
├── shared/
│   ├── commonMain/
│   │   ├── kotlin/
│   │   │   ├── data/
│   │   │   │   ├── models/          # 数据模型
│   │   │   │   ├── repositories/    # 数据仓库
│   │   │   │   └── api/             # API 客户端
│   │   │   ├── domain/
│   │   │   │   ├── usecases/        # 业务逻辑
│   │   │   │   └── services/         # 服务层
│   │   │   └── utils/               # 工具类
│   │   ├── resources/
│   │   └── build.gradle.kts
│   ├── androidMain/
│   │   └── kotlin/
│   ├── iosMain/
│   │   └── kotlin/
│   └── build.gradle.kts
├── androidApp/
│   └── build.gradle.kts
├── iosApp/
│   └── build.gradle.kts
└── build.gradle.kts
```

#### 1.2 配置 build.gradle.kts

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    id("com.android.library")
}

kotlin {
    androidTarget()
    iosX64()
    iosArm64()
    iosSimulatorArm64()
    
    sourceSets {
        val commonMain by getting {
            dependencies {
                // Ktor for networking
                implementation("io.ktor:ktor-client-core:2.3.5")
                implementation("io.ktor:ktor-client-content-negotiation:2.3.5")
                implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.5")
                
                // Kotlinx Serialization
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
                
                // Coroutines
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                
                // Koin for DI
                implementation("io.insert-koin:koin-core:3.5.0")
                
                // SQLDelight for local storage
                implementation("app.cash.sqldelight:runtime:2.0.0")
            }
        }
        
        val androidMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-android:2.3.5")
                implementation("app.cash.sqldelight:android-driver:2.0.0")
            }
        }
        
        val iosMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-darwin:2.3.5")
                implementation("app.cash.sqldelight:native-driver:2.0.0")
            }
        }
    }
}
```

### 阶段二：数据模型迁移

#### 2.1 将 TypeScript 类型转换为 Kotlin 数据类

**原 TypeScript 类型** (`types.ts`):
```typescript
interface GameState {
    currentScreen: string;
    userProfile: UserProfile | null;
    selectedSceneId: string | null;
    // ...
}
```

**Kotlin 等价实现**:
```kotlin
// shared/commonMain/kotlin/data/models/GameState.kt
@Serializable
data class GameState(
    val currentScreen: Screen,
    val userProfile: UserProfile? = null,
    val selectedSceneId: String? = null,
    val selectedCharacterId: String? = null,
    val selectedScenarioId: String? = null,
    val history: Map<String, List<Message>> = emptyMap(),
    val journalEntries: List<JournalEntry> = emptyList(),
    val userWorldScenes: List<WorldScene> = emptyList(),
    val customScenes: List<WorldScene> = emptyList(),
    val customCharacters: Map<String, List<Character>> = emptyMap(),
    val customScenarios: List<CustomScenario> = emptyList(),
    val settings: AppSettings = AppSettings(),
    val mailbox: List<Mail> = emptyList(),
    val lastLoginTime: Long = System.currentTimeMillis()
)

@Serializable
enum class Screen {
    PROFILE_SETUP,
    REAL_WORLD,
    SCENE_SELECTION,
    CHARACTER_SELECTION,
    CHAT,
    CONNECTION_SPACE,
    MOBILE_PROFILE
}
```

#### 2.2 核心数据模型

```kotlin
// UserProfile.kt
@Serializable
data class UserProfile(
    val id: String,
    val nickname: String,
    val avatarUrl: String = "",
    val email: String? = null,
    val isGuest: Boolean = false,
    val phoneNumber: String? = null
)

// Character.kt
@Serializable
data class Character(
    val id: String,
    val name: String,
    val age: Int,
    val role: String,
    val bio: String,
    val avatarUrl: String = "",
    val backgroundUrl: String = "",
    val themeColor: String = "blue-500",
    val colorAccent: String = "#3b82f6",
    val firstMessage: String = "",
    val systemInstruction: String = "",
    val voiceName: String = "Aoede",
    val mbti: String = "INFJ",
    val tags: List<String> = emptyList(),
    val speechStyle: String = "",
    val catchphrases: List<String> = emptyList(),
    val secrets: String = "",
    val motivations: String = "",
    val relationships: String = ""
)

// WorldScene.kt
@Serializable
data class WorldScene(
    val id: String,
    val name: String,
    val description: String,
    val imageUrl: String = "",
    val systemEraId: Long? = null,
    val mainStory: Character? = null,
    val characters: List<Character> = emptyList(),
    val scenes: List<WorldScene> = emptyList(),
    val worldId: Long? = null
)

// JournalEntry.kt
@Serializable
data class JournalEntry(
    val id: String,
    val title: String,
    val content: String,
    val timestamp: Long,
    val imageUrl: String = "",
    val insight: String? = null,
    val tags: List<String> = emptyList()
)

// CustomScenario.kt
@Serializable
data class CustomScenario(
    val id: String,
    val sceneId: String,
    val title: String,
    val description: String,
    val author: String,
    val startNodeId: String,
    val nodes: Map<String, ScenarioNode>
)

@Serializable
data class ScenarioNode(
    val id: String,
    val prompt: String,
    val nextNodes: List<String> = emptyList()
)
```

### 阶段三：API 客户端迁移

#### 3.1 使用 Ktor 替代 fetch/axios

```kotlin
// shared/commonMain/kotlin/data/api/ApiClient.kt
class ApiClient(private val baseUrl: String) {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
                encodeDefaults = false
            })
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
        }
    }
    
    suspend fun <T> get(
        endpoint: String,
        token: String? = null
    ): ApiResponse<T> {
        return client.get("$baseUrl$endpoint") {
            token?.let { bearerAuth(it) }
        }.body()
    }
    
    suspend fun <T> post(
        endpoint: String,
        body: Any,
        token: String? = null
    ): ApiResponse<T> {
        return client.post("$baseUrl$endpoint") {
            token?.let { bearerAuth(it) }
            contentType(ContentType.Application.Json)
            setBody(body)
        }.body()
    }
    
    suspend fun <T> put(
        endpoint: String,
        body: Any,
        token: String? = null
    ): ApiResponse<T> {
        return client.put("$baseUrl$endpoint") {
            token?.let { bearerAuth(it) }
            contentType(ContentType.Application.Json)
            setBody(body)
        }.body()
    }
    
    suspend fun delete(
        endpoint: String,
        token: String? = null
    ) {
        client.delete("$baseUrl$endpoint") {
            token?.let { bearerAuth(it) }
        }
    }
}
```

#### 3.2 API 服务接口

```kotlin
// shared/commonMain/kotlin/data/api/AuthApi.kt
interface AuthApi {
    suspend fun login(username: String, password: String): ApiResponse<AuthResponse>
    suspend fun loginWithWeChat(code: String): ApiResponse<AuthResponse>
    suspend fun getCurrentUser(token: String): ApiResponse<User>
    suspend fun register(request: RegisterRequest): ApiResponse<AuthResponse>
}

class AuthApiImpl(private val client: ApiClient) : AuthApi {
    override suspend fun login(username: String, password: String) =
        client.post("/api/auth/login", LoginRequest(username, password))
    
    override suspend fun loginWithWeChat(code: String) =
        client.post("/api/auth/wechat/login", WeChatLoginRequest(code))
    
    override suspend fun getCurrentUser(token: String) =
        client.get("/api/auth/me", token)
    
    override suspend fun register(request: RegisterRequest) =
        client.post("/api/auth/register", request)
}
```

### 阶段四：状态管理迁移

#### 4.1 使用 StateFlow 替代 React State

```kotlin
// shared/commonMain/kotlin/domain/GameStateManager.kt
class GameStateManager(
    private val storageService: StorageService,
    private val syncService: SyncService
) {
    private val _gameState = MutableStateFlow(GameState())
    val gameState: StateFlow<GameState> = _gameState.asStateFlow()
    
    init {
        loadState()
    }
    
    private fun loadState() {
        viewModelScope.launch {
            val saved = storageService.loadState()
            _gameState.value = saved ?: GameState()
        }
    }
    
    fun updateState(update: GameState.() -> GameState) {
        _gameState.value = _gameState.value.update()
        saveState()
    }
    
    private fun saveState() {
        viewModelScope.launch {
            storageService.saveState(_gameState.value)
        }
    }
    
    fun setCurrentScreen(screen: Screen) {
        updateState { copy(currentScreen = screen) }
    }
    
    fun setUserProfile(profile: UserProfile) {
        updateState { copy(userProfile = profile) }
    }
    
    fun selectScene(sceneId: String) {
        updateState {
            copy(
                selectedSceneId = sceneId,
                selectedCharacterId = null,
                currentScreen = Screen.CHARACTER_SELECTION
            )
        }
    }
    
    fun selectCharacter(characterId: String) {
        updateState {
            copy(
                selectedCharacterId = characterId,
                currentScreen = Screen.CHAT
            )
        }
    }
}
```

#### 4.2 使用 ViewModel (Android) / ObservableObject (iOS)

```kotlin
// Android ViewModel
class MobileAppViewModel(
    private val gameStateManager: GameStateManager,
    private val authApi: AuthApi,
    private val worldApi: WorldApi
) : ViewModel() {
    
    val gameState: StateFlow<GameState> = gameStateManager.gameState
    
    fun handleLogin(username: String, password: String) {
        viewModelScope.launch {
            try {
                val response = authApi.login(username, password)
                if (response.success) {
                    // 保存 token
                    // 加载用户数据
                    loadUserData(response.data.token)
                }
            } catch (e: Exception) {
                // 处理错误
            }
        }
    }
    
    private suspend fun loadUserData(token: String) {
        val user = authApi.getCurrentUser(token)
        val worlds = worldApi.getAllWorlds(token)
        val eras = eraApi.getAllEras(token)
        val characters = characterApi.getAllCharacters(token)
        
        // 转换并更新状态
        gameStateManager.updateState {
            copy(
                userProfile = user.toUserProfile(),
                userWorldScenes = convertToWorldScenes(worlds, eras, characters)
            )
        }
    }
}
```

### 阶段五：本地存储迁移

#### 5.1 使用 SQLDelight 替代 localStorage

```sql
-- shared/commonMain/sqldelight/GameState.sq
CREATE TABLE game_state (
    id INTEGER PRIMARY KEY,
    current_screen TEXT NOT NULL,
    user_profile_json TEXT,
    selected_scene_id TEXT,
    selected_character_id TEXT,
    last_login_time INTEGER NOT NULL
);

CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    image_url TEXT,
    insight TEXT,
    tags_json TEXT
);

CREATE TABLE custom_scenarios (
    id TEXT PRIMARY KEY,
    scene_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    start_node_id TEXT,
    nodes_json TEXT NOT NULL
);
```

```kotlin
// shared/commonMain/kotlin/data/repositories/StorageRepository.kt
class StorageRepository(private val database: AppDatabase) {
    suspend fun saveGameState(state: GameState) {
        database.transaction {
            database.gameStateQueries.insertOrReplace(
                id = 1,
                currentScreen = state.currentScreen.name,
                userProfileJson = Json.encodeToString(state.userProfile),
                selectedSceneId = state.selectedSceneId,
                selectedCharacterId = state.selectedCharacterId,
                lastLoginTime = state.lastLoginTime
            )
        }
    }
    
    suspend fun loadGameState(): GameState? {
        val row = database.gameStateQueries.selectById(1).executeAsOneOrNull()
        return row?.let {
            GameState(
                currentScreen = Screen.valueOf(it.currentScreen),
                userProfile = Json.decodeFromString(it.userProfileJson ?: "null"),
                selectedSceneId = it.selectedSceneId,
                selectedCharacterId = it.selectedCharacterId,
                lastLoginTime = it.lastLoginTime
            )
        }
    }
}
```

### 阶段六：UI 组件迁移

#### 6.1 Compose Multiplatform (推荐)

```kotlin
// shared/commonMain/kotlin/ui/screens/MobileAppScreen.kt
@Composable
fun MobileAppScreen(
    viewModel: MobileAppViewModel = getViewModel()
) {
    val gameState by viewModel.gameState.collectAsState()
    
    when (gameState.currentScreen) {
        Screen.PROFILE_SETUP -> ProfileSetupScreen(
            onGuestLogin = { nickname ->
                viewModel.handleGuestLogin(nickname)
            },
            onAccountLogin = {
                viewModel.showLoginModal = true
            }
        )
        Screen.REAL_WORLD -> RealWorldScreen(
            entries = gameState.journalEntries,
            onAddEntry = viewModel::addJournalEntry,
            onUpdateEntry = viewModel::updateJournalEntry,
            onDeleteEntry = viewModel::deleteJournalEntry
        )
        Screen.SCENE_SELECTION -> SceneSelectionScreen(
            scenes = gameState.getCurrentScenes(),
            onSelectScene = viewModel::selectScene,
            onCreateScene = { viewModel.showEraCreator = true }
        )
        Screen.CHARACTER_SELECTION -> CharacterSelectionScreen(
            scene = gameState.getCurrentScene(),
            characters = gameState.getCurrentSceneCharacters(),
            onSelectCharacter = viewModel::selectCharacter
        )
        Screen.CHAT -> ChatScreen(
            character = gameState.getActiveCharacter(),
            history = gameState.history[gameState.selectedCharacterId] ?: emptyList(),
            onSendMessage = viewModel::sendMessage
        )
    }
    
    // Modals
    if (viewModel.showLoginModal) {
        LoginModal(
            onLoginSuccess = viewModel::handleLoginSuccess,
            onCancel = { viewModel.showLoginModal = false }
        )
    }
}
```

#### 6.2 平台特定 UI (备选方案)

如果不想使用 Compose Multiplatform，可以使用平台原生 UI：

**Android (Jetpack Compose)**:
```kotlin
// androidApp/src/main/java/.../MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MobileAppTheme {
                MobileAppScreen()
            }
        }
    }
}
```

**iOS (SwiftUI)**:
```swift
// iosApp/iosApp/ContentView.swift
struct ContentView: View {
    @StateObject private var viewModel = MobileAppViewModel()
    
    var body: some View {
        MobileAppScreen(viewModel: viewModel)
    }
}
```

### 阶段七：依赖注入

#### 7.1 使用 Koin

```kotlin
// shared/commonMain/kotlin/di/AppModule.kt
val appModule = module {
    // API Clients
    single { ApiClient("http://localhost:8081") }
    single<AuthApi> { AuthApiImpl(get()) }
    single<WorldApi> { WorldApiImpl(get()) }
    single<EraApi> { EraApiImpl(get()) }
    single<CharacterApi> { CharacterApiImpl(get()) }
    single<JournalApi> { JournalApiImpl(get()) }
    
    // Repositories
    single<StorageRepository> { StorageRepositoryImpl(get()) }
    single<SyncRepository> { SyncRepositoryImpl(get()) }
    
    // Services
    single<StorageService> { StorageServiceImpl(get()) }
    single<SyncService> { SyncServiceImpl(get()) }
    single<AIService> { AIServiceImpl(get()) }
    
    // Managers
    single { GameStateManager(get(), get()) }
    
    // ViewModels
    viewModel { MobileAppViewModel(get(), get(), get()) }
}
```

### 阶段八：迁移步骤清单

#### 8.1 准备阶段
- [ ] 创建 Kuikly 项目结构
- [ ] 配置 build.gradle.kts
- [ ] 设置开发环境（Android Studio / Xcode）

#### 8.2 数据层迁移
- [ ] 转换 TypeScript 类型为 Kotlin 数据类
- [ ] 实现 API 客户端（Ktor）
- [ ] 实现本地存储（SQLDelight）
- [ ] 实现数据仓库层

#### 8.3 业务逻辑迁移
- [ ] 迁移状态管理（StateFlow）
- [ ] 迁移业务用例（UseCases）
- [ ] 迁移服务层（Services）
- [ ] 实现依赖注入（Koin）

#### 8.4 UI 层迁移
- [ ] 迁移核心屏幕（Screens）
- [ ] 迁移组件（Components）
- [ ] 迁移模态框（Modals）
- [ ] 实现导航（Navigation）

#### 8.5 测试与优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] UI 测试
- [ ] 性能优化

## 关键技术映射

| React/TypeScript | Kotlin MultiPlatform |
|-----------------|---------------------|
| `useState` | `StateFlow` / `MutableStateFlow` |
| `useEffect` | `LaunchedEffect` / `DisposableEffect` |
| `useContext` | Koin Dependency Injection |
| `localStorage` | SQLDelight |
| `fetch/axios` | Ktor HttpClient |
| `React.Component` | `@Composable` function |
| `props` | Function parameters |
| `setState` | `StateFlow.update` |
| TypeScript interfaces | Kotlin data classes |
| `async/await` | Kotlin coroutines |

## 注意事项

1. **异步处理**: Kotlin 使用协程，语法与 JavaScript async/await 类似但更强大
2. **状态管理**: StateFlow 是响应式的，类似于 React 的 state
3. **类型安全**: Kotlin 的类型系统比 TypeScript 更严格
4. **空安全**: Kotlin 有内置的空安全机制
5. **序列化**: 使用 kotlinx.serialization 替代 JSON.parse/stringify

## 迁移时间估算

- **阶段一（项目初始化）**: 1-2 天
- **阶段二（数据模型）**: 2-3 天
- **阶段三（API 客户端）**: 3-5 天
- **阶段四（状态管理）**: 3-4 天
- **阶段五（本地存储）**: 2-3 天
- **阶段六（UI 组件）**: 10-15 天
- **阶段七（依赖注入）**: 1-2 天
- **阶段八（测试优化）**: 5-7 天

**总计**: 约 27-41 个工作日（5-8 周）

## 参考资料

- [Kuikly 官方文档](https://github.com/tencent/kuikly)
- [Kotlin Multiplatform 文档](https://kotlinlang.org/docs/multiplatform.html)
- [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)
- [Ktor 文档](https://ktor.io/)
- [SQLDelight 文档](https://cashapp.github.io/sqldelight/)

