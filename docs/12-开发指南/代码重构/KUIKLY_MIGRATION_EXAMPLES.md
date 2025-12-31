# Kuikly 迁移示例代码

## 示例 1: 登录功能迁移

### React/TypeScript 原代码

```typescript
// MobileApp.tsx
const [showLoginModal, setShowLoginModal] = useState(false);

const handleLoginSuccess = async (method: 'password' | 'wechat', identifier: string) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        const userInfo = await authApi.getCurrentUser(token);
        setGameState(prev => ({
            ...prev,
            userProfile: {
                id: userInfo.id.toString(),
                nickname: userInfo.nickname || userInfo.username,
                avatarUrl: userInfo.avatar || '',
                isGuest: false
            }
        }));
    }
    setShowLoginModal(false);
};
```

### Kotlin 等价实现

```kotlin
// shared/commonMain/kotlin/ui/screens/LoginScreen.kt
@Composable
fun LoginScreen(
    viewModel: MobileAppViewModel = getViewModel()
) {
    val showLoginModal by viewModel.showLoginModal.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.checkAuthToken()
    }
    
    if (showLoginModal) {
        LoginModal(
            onLoginSuccess = { method, identifier ->
                viewModel.handleLoginSuccess(method, identifier)
            },
            onCancel = { viewModel.showLoginModal.value = false }
        )
    }
}

// shared/commonMain/kotlin/domain/MobileAppViewModel.kt
class MobileAppViewModel(
    private val authApi: AuthApi,
    private val gameStateManager: GameStateManager,
    private val storageService: StorageService
) : ViewModel() {
    
    val showLoginModal = MutableStateFlow(false)
    
    fun handleLoginSuccess(method: LoginMethod, identifier: String) {
        viewModelScope.launch {
            try {
                val token = storageService.getAuthToken()
                if (token != null) {
                    val userInfo = authApi.getCurrentUser(token)
                    gameStateManager.updateState {
                        copy(
                            userProfile = UserProfile(
                                id = userInfo.id.toString(),
                                nickname = userInfo.nickname ?: userInfo.username,
                                avatarUrl = userInfo.avatar ?: "",
                                isGuest = false
                            )
                        )
                    }
                }
                showLoginModal.value = false
            } catch (e: Exception) {
                // 处理错误
                println("登录失败: ${e.message}")
            }
        }
    }
}
```

## 示例 2: 场景选择功能迁移

### React/TypeScript 原代码

```typescript
const handleSelectScene = (sceneId: string) => {
    setGameState(prev => ({
        ...prev,
        selectedSceneId: sceneId,
        selectedCharacterId: null,
        currentScreen: 'characterSelection'
    }));
};

const getCurrentScenes = () => {
    if (gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes) {
        const userWorldSceneIds = new Set(gameState.userWorldScenes.map(s => s.id));
        const customScenesOnly = gameState.customScenes.filter(s => !userWorldSceneIds.has(s.id));
        return [...gameState.userWorldScenes, ...customScenesOnly];
    } else {
        return [...WORLD_SCENES, ...gameState.customScenes];
    }
};
```

### Kotlin 等价实现

```kotlin
// shared/commonMain/kotlin/domain/GameStateManager.kt
class GameStateManager {
    fun selectScene(sceneId: String) {
        updateState {
            copy(
                selectedSceneId = sceneId,
                selectedCharacterId = null,
                currentScreen = Screen.CHARACTER_SELECTION
            )
        }
    }
    
    fun getCurrentScenes(): List<WorldScene> {
        val state = gameState.value
        return if (state.userProfile != null && !state.userProfile.isGuest && state.userWorldScenes.isNotEmpty()) {
            val userWorldSceneIds = state.userWorldScenes.map { it.id }.toSet()
            val customScenesOnly = state.customScenes.filter { it.id !in userWorldSceneIds }
            state.userWorldScenes + customScenesOnly
        } else {
            WORLD_SCENES + state.customScenes
        }
    }
}

// shared/commonMain/kotlin/ui/screens/SceneSelectionScreen.kt
@Composable
fun SceneSelectionScreen(
    viewModel: MobileAppViewModel = getViewModel()
) {
    val gameState by viewModel.gameState.collectAsState()
    val scenes = remember(gameState) {
        viewModel.gameStateManager.getCurrentScenes()
    }
    
    LazyColumn {
        items(scenes) { scene ->
            SceneCard(
                scene = scene,
                onClick = { viewModel.selectScene(scene.id) }
            )
        }
    }
}
```

## 示例 3: 聊天功能迁移

### React/TypeScript 原代码

```typescript
const [history, setHistory] = useState<Message[]>([]);

const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now()
    };
    
    setHistory(prev => [...prev, newMessage]);
    
    const response = await aiService.sendMessage(
        activeCharacter,
        [...history, newMessage]
    );
    
    setHistory(prev => [...prev, response]);
};
```

### Kotlin 等价实现

```kotlin
// shared/commonMain/kotlin/ui/screens/ChatScreen.kt
@Composable
fun ChatScreen(
    character: Character,
    viewModel: ChatViewModel = getViewModel()
) {
    val history by viewModel.history.collectAsState()
    var inputText by remember { mutableStateOf("") }
    
    Column {
        LazyColumn(
            modifier = Modifier.weight(1f)
        ) {
            items(history) { message ->
                MessageBubble(message = message)
            }
        }
        
        Row {
            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                modifier = Modifier.weight(1f)
            )
            Button(onClick = {
                viewModel.sendMessage(inputText)
                inputText = ""
            }) {
                Text("发送")
            }
        }
    }
}

// shared/commonMain/kotlin/domain/ChatViewModel.kt
class ChatViewModel(
    private val character: Character,
    private val aiService: AIService
) : ViewModel() {
    
    private val _history = MutableStateFlow<List<Message>>(emptyList())
    val history: StateFlow<List<Message>> = _history.asStateFlow()
    
    fun sendMessage(text: String) {
        viewModelScope.launch {
            val userMessage = Message(
                id = "msg_${System.currentTimeMillis()}",
                role = MessageRole.USER,
                content = text,
                timestamp = System.currentTimeMillis()
            )
            
            _history.value = _history.value + userMessage
            
            try {
                val response = aiService.sendMessage(
                    character = character,
                    messages = _history.value
                )
                _history.value = _history.value + response
            } catch (e: Exception) {
                // 处理错误
                println("发送消息失败: ${e.message}")
            }
        }
    }
}
```

## 示例 4: 日记功能迁移

### React/TypeScript 原代码

```typescript
const handleAddEntry = async (title: string, content: string, imageUrl: string) => {
    const newEntry: JournalEntry = {
        id: `e_${Date.now()}`,
        title,
        content,
        timestamp: Date.now(),
        imageUrl,
        insight: undefined
    };
    
    setGameState(prev => ({
        ...prev,
        journalEntries: [...prev.journalEntries, newEntry]
    }));
    
    const token = localStorage.getItem('auth_token');
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
        try {
            await syncService.handleLocalDataChange('journal', newEntry);
        } catch (error) {
            console.error('日记同步失败:', error);
        }
    }
};
```

### Kotlin 等价实现

```kotlin
// shared/commonMain/kotlin/domain/JournalViewModel.kt
class JournalViewModel(
    private val syncService: SyncService,
    private val gameStateManager: GameStateManager,
    private val storageService: StorageService
) : ViewModel() {
    
    fun addEntry(title: String, content: String, imageUrl: String) {
        viewModelScope.launch {
            val newEntry = JournalEntry(
                id = "e_${System.currentTimeMillis()}",
                title = title,
                content = content,
                timestamp = System.currentTimeMillis(),
                imageUrl = imageUrl,
                insight = null
            )
            
            // 立即更新本地状态
            gameStateManager.updateState {
                copy(journalEntries = journalEntries + newEntry)
            }
            
            // 异步同步到服务器
            val token = storageService.getAuthToken()
            val userProfile = gameStateManager.gameState.value.userProfile
            if (token != null && userProfile != null && !userProfile.isGuest) {
                try {
                    syncService.handleLocalDataChange("journal", newEntry)
                } catch (e: Exception) {
                    println("日记同步失败: ${e.message}")
                }
            }
        }
    }
}
```

## 示例 5: API 调用迁移

### React/TypeScript 原代码

```typescript
// services/api.ts
export const worldApi = {
    getAllWorlds: async (token: string): Promise<World[]> => {
        const response = await fetch('http://localhost:8081/api/worlds', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.data;
    }
};
```

### Kotlin 等价实现

```kotlin
// shared/commonMain/kotlin/data/api/WorldApi.kt
interface WorldApi {
    suspend fun getAllWorlds(token: String): List<World>
}

class WorldApiImpl(private val client: ApiClient) : WorldApi {
    override suspend fun getAllWorlds(token: String): List<World> {
        val response: ApiResponse<List<World>> = client.get(
            endpoint = "/api/worlds",
            token = token
        )
        return response.data ?: emptyList()
    }
}

// shared/commonMain/kotlin/data/api/ApiClient.kt
class ApiClient(private val baseUrl: String) {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }
    
    suspend fun <T> get(
        endpoint: String,
        token: String? = null
    ): ApiResponse<T> {
        return client.get("$baseUrl$endpoint") {
            token?.let { 
                header(HttpHeaders.Authorization, "Bearer $it")
            }
        }.body()
    }
}
```

## 示例 6: 本地存储迁移

### React/TypeScript 原代码

```typescript
// services/storage.ts
export const storageService = {
    saveState: async (state: GameState) => {
        localStorage.setItem('gameState', JSON.stringify(state));
    },
    loadState: async (): Promise<GameState | null> => {
        const saved = localStorage.getItem('gameState');
        return saved ? JSON.parse(saved) : null;
    }
};
```

### Kotlin 等价实现

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
                lastLoginTime = state.lastLoginTime,
                // ... 其他字段
            )
        }
    }
    
    suspend fun loadGameState(): GameState? {
        return withContext(Dispatchers.IO) {
            val row = database.gameStateQueries.selectById(1).executeAsOneOrNull()
            row?.let {
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
}
```

## 示例 7: useEffect 迁移

### React/TypeScript 原代码

```typescript
useEffect(() => {
    const init = async () => {
        const loaded = await storageService.loadState();
        if (loaded) {
            setGameState(prev => ({ ...prev, ...loaded }));
        }
        setIsLoaded(true);
    };
    init();
}, []);
```

### Kotlin 等价实现

```kotlin
// 在 ViewModel 中
class MobileAppViewModel : ViewModel() {
    private val _isLoaded = MutableStateFlow(false)
    val isLoaded: StateFlow<Boolean> = _isLoaded.asStateFlow()
    
    init {
        viewModelScope.launch {
            val loaded = storageService.loadState()
            if (loaded != null) {
                gameStateManager.updateState { loaded }
            }
            _isLoaded.value = true
        }
    }
}

// 在 Composable 中
@Composable
fun MobileAppScreen(viewModel: MobileAppViewModel = getViewModel()) {
    val isLoaded by viewModel.isLoaded.collectAsState()
    
    if (!isLoaded) {
        CircularProgressIndicator()
        return
    }
    
    // 渲染主界面
}
```

## 迁移检查清单

### 数据层
- [ ] 所有 TypeScript 接口已转换为 Kotlin 数据类
- [ ] API 调用已迁移到 Ktor
- [ ] 本地存储已迁移到 SQLDelight
- [ ] 数据仓库层已实现

### 业务逻辑层
- [ ] React Hooks 已转换为 StateFlow/ViewModel
- [ ] 异步操作已迁移到协程
- [ ] 业务用例已实现
- [ ] 错误处理已完善

### UI 层
- [ ] React 组件已转换为 Composable 函数
- [ ] 状态管理已迁移到 StateFlow
- [ ] 导航已实现
- [ ] 模态框已迁移

### 测试
- [ ] 单元测试已编写
- [ ] 集成测试已通过
- [ ] UI 测试已实现

