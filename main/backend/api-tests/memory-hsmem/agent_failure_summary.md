# API Test Failure Summary

## Failed case
- Case ID: case_2_1
- Case name: GET /hsmem/statistics
- Step index: 0 (0-based)

## Step
- Method: GET
- Path: /api/memory/v1/hsmem/statistics
- Body: (none)

## Error
Expected status 200, got 500

## Response
- Status: 500
- Body (excerpt): {"code":500,"message":"服务器内部错误: Error creating bean with name 'memoryController' defined in file [/Users/admin/Workspace/heartsphere_new/main/backend/target/classes/com/heartsphere/memory/controller/MemoryController.class]: Unsatisfied dependency expressed through constructor parameter 4: No qualifying bean of type 'com.heartsphere.memory.service.hsmem.HSMemApi' available: expected single matching bean but found 2: HSMemClientService,hsmemApiRemote","data":null,"timestamp":"2026-01-30T07:18:38.091256"}

## Backend log (last lines)

```
[INFO] Changes detected - recompiling the module! :source
[INFO] Compiling 115 source files with javac [forked debug release 17] to target/test-classes
[INFO] 
[INFO] <<< spring-boot:3.2.0:run (default-cli) < test-compile @ heartsphere-service <<<
[INFO] 
[INFO] 
[INFO] --- spring-boot:3.2.0:run (default-cli) @ heartsphere-service ---
[INFO] Attaching agents: []

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

2026-01-30 07:18:12.213 [main] INFO  com.heartsphere.HeartSphereApplication - Starting HeartSphereApplication using Java 17.0.12 with PID 7362 (/Users/admin/Workspace/heartsphere_new/main/backend/target/classes started by admin in /Users/admin/Workspace/heartsphere_new/main/backend)
2026-01-30 07:18:12.215 [main] INFO  com.heartsphere.HeartSphereApplication - The following 1 profile is active: "dev"
2026-01-30 07:18:13.537 [main] INFO  o.s.d.r.config.RepositoryConfigurationDelegate - Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-01-30 07:18:13.915 [main] INFO  o.s.d.r.config.RepositoryConfigurationDelegate - Finished Spring Data repository scanning in 369 ms. Found 104 JPA repository interfaces.
2026-01-30 07:18:15.743 [main] INFO  o.s.boot.web.embedded.tomcat.TomcatWebServer - Tomcat initialized with port 8081 (http)
2026-01-30 07:18:15.753 [main] INFO  org.apache.catalina.core.StandardService - Starting service [Tomcat]
2026-01-30 07:18:15.753 [main] INFO  org.apache.catalina.core.StandardEngine - Starting Servlet engine: [Apache Tomcat/10.1.16]
2026-01-30 07:18:15.823 [main] INFO  o.a.c.core.ContainerBase.[Tomcat].[localhost].[/] - Initializing Spring embedded WebApplicationContext
2026-01-30 07:18:15.824 [main] INFO  o.s.b.w.s.c.ServletWebServerApplicationContext - Root WebApplicationContext: initialization completed in 3540 ms
2026-01-30 07:18:16.047 [main] INFO  org.hibernate.jpa.internal.util.LogHelper - HHH000204: Processing PersistenceUnitInfo [name: default]
2026-01-30 07:18:16.090 [main] INFO  org.hibernate.Version - HHH000412: Hibernate ORM core version 6.3.1.Final
2026-01-30 07:18:16.115 [main] INFO  o.hibernate.cache.internal.RegionFactoryInitiator - HHH000026: Second-level cache disabled
2026-01-30 07:18:16.298 [main] INFO  o.s.o.j.persistenceunit.SpringPersistenceUnitInfo - No LoadTimeWeaver setup: ignoring JPA class transformer
2026-01-30 07:18:16.320 [main] WARN  org.hibernate.orm.deprecation - HHH90000025: MySQLDialect does not need to be specified explicitly using 'hibernate.dialect' (remove the property setting and it will be selected by default)
2026-01-30 07:18:18.768 [main] INFO  o.h.e.t.jta.platform.internal.JtaPlatformInitiator - HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
2026-01-30 07:18:18.770 [main] INFO  o.s.orm.jpa.LocalContainerEntityManagerFactoryBean - Initialized JPA EntityManagerFactory for persistence unit 'default'
2026-01-30 07:18:19.454 [main] DEBUG com.heartsphere.security.JwtAuthenticationFilter - Filter 'jwtAuthenticationFilter' configured for use
2026-01-30 07:18:19.855 [main] INFO  c.heartsphere.ai.mcp.config.McpRestTemplateConfig - [ai.mcp] MCP RestTemplate configured (connect 30s, response 60s)
2026-01-30 07:18:20.061 [main] INFO  o.s.data.jpa.repository.query.QueryEnhancerFactory - Hibernate is in classpath; If applicable, HQL parser will be used.
2026-01-30 07:18:25.573 [main] WARN  o.s.b.a.o.j.JpaBaseConfiguration$JpaWebConfiguration - spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2026-01-30 07:18:25.821 [main] INFO  o.s.boot.web.embedded.tomcat.TomcatWebServer - Tomcat started on port 8081 (http) with context path ''
2026-01-30 07:18:25.841 [main] INFO  com.heartsphere.HeartSphereApplication - Started HeartSphereApplication in 14.352 seconds (process running for 14.672)
2026-01-30 07:18:25.854 [billing-init] INFO  c.h.billing.config.BillingDataInitializer - 开始异步初始化计费数据...
2026-01-30 07:18:25.879 [billing-init] INFO  com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Starting...
2026-01-30 07:18:26.007 [billing-init] INFO  com.zaxxer.hikari.pool.HikariPool - HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@6b99155b
2026-01-30 07:18:26.008 [billing-init] INFO  com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Start completed.
2026-01-30 07:18:26.011 [billing-init] INFO  c.h.billing.service.BillingInitializationService - 开始初始化计费数据（仅初始化provider和资源池）...
2026-01-30 07:18:26.071 [billing-init] INFO  c.h.billing.service.BillingInitializationService - 资源池初始化完成
2026-01-30 07:18:26.071 [billing-init] INFO  c.h.billing.service.BillingInitializationService - 计费数据初始化完成（模型配置请通过管理后台在ai_model_config中管理）
2026-01-30 07:18:26.073 [billing-init] INFO  c.h.billing.config.BillingDataInitializer - 计费数据初始化完成
2026-01-30 07:18:27.601 [scheduling-1] INFO  c.heartsphere.ai.skill.service.SkillRecordMonitor - 技能执行记录监控指标 - 总创建: 0, 总失败: 0, 成功率: 100.0%, 异步任务: 0, 异步失败: 0
2026-01-30 07:18:27.609 [scheduling-1] INFO  c.heartsphere.billing.service.BillingAlertService - 提供商 1 已有未解决的余额提醒，跳过创建
2026-01-30 07:18:27.613 [scheduling-1] INFO  c.heartsphere.billing.service.BillingAlertService - 提供商 3 已有未解决的余额提醒，跳过创建
2026-01-30 07:18:27.615 [scheduling-1] INFO  c.heartsphere.billing.service.BillingAlertService - 提供商 4 已有未解决的余额提醒，跳过创建
2026-01-30 07:18:31.244 [http-nio-8081-exec-1] INFO  o.a.c.core.ContainerBase.[Tomcat].[localhost].[/] - Initializing Spring DispatcherServlet 'dispatcherServlet'
2026-01-30 07:18:31.244 [http-nio-8081-exec-1] INFO  org.springframework.web.servlet.DispatcherServlet - Initializing Servlet 'dispatcherServlet'
2026-01-30 07:18:31.578 [http-nio-8081-exec-1] INFO  org.springframework.web.servlet.DispatcherServlet - Completed initialization in 334 ms
2026-01-30 07:18:31.713 [http-nio-8081-exec-1] INFO  o.s.security.web.DefaultSecurityFilterChain - Will secure any request with [org.springframework.security.web.session.DisableEncodeUrlFilter@7c49eaeb, org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter@6e17e292, org.springframework.security.web.context.SecurityContextHolderFilter@3119bcd5, org.springframework.security.web.header.HeaderWriterFilter@2a3e47b1, org.springframework.web.filter.CorsFilter@72aa321, org.springframework.security.web.authentication.logout.LogoutFilter@4471f385, com.heartsphere.security.JwtAuthenticationFilter@76745c61, com.heartsphere.security.ApiKeyAuthenticationFilter@703b5790, org.springframework.security.web.savedrequest.RequestCacheAwareFilter@5d6bfb07, org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter@4c964aaf, org.springframework.security.web.authentication.AnonymousAuthenticationFilter@44d4c2a2, org.springframework.security.web.session.SessionManagementFilter@20864d11, org.springframework.security.web.access.ExceptionTranslationFilter@47b32794, org.springframework.security.web.access.intercept.AuthorizationFilter@5757c079]
2026-01-30 07:18:31.728 [http-nio-8081-exec-1] DEBUG com.heartsphere.security.JwtAuthenticationFilter - No Authorization header found in request
2026-01-30 07:18:31.729 [http-nio-8081-exec-1] DEBUG com.heartsphere.security.JwtAuthenticationFilter - No JWT token found in request headers
2026-01-30 07:18:31.729 [http-nio-8081-exec-1] INFO  c.heartsphere.security.ApiKeyAuthenticationFilter - No API Key found in request headers
2026-01-30 07:18:31.730 [http-nio-8081-exec-1] WARN  o.s.web.servlet.handler.HandlerMappingIntrospector - Cache miss for REQUEST dispatch to '/api/health' (previous null). Performing MatchableHandlerMapping lookup. This is logged once only at WARN level, and every time at TRACE.
2026-01-30 07:18:31.737 [http-nio-8081-exec-1] INFO  c.h.heartconnect.interceptor.SharedModeInterceptor - ========== [SharedModeInterceptor] 处理请求 ==========
2026-01-30 07:18:31.738 [http-nio-8081-exec-1] INFO  c.h.heartconnect.interceptor.SharedModeInterceptor - 请求路径: /api/health
2026-01-30 07:18:31.738 [http-nio-8081-exec-1] INFO  c.h.heartconnect.interceptor.SharedModeInterceptor - 查询字符串: null
2026-01-30 07:18:31.738 [http-nio-8081-exec-1] INFO  c.h.heartconnect.interceptor.SharedModeInterceptor - 查询参数 shareConfigId: null
2026-01-30 07:18:37.031 [http-nio-8081-exec-3] DEBUG com.heartsphere.security.JwtAuthenticationFilter - No Authorization header found in request
2026-01-30 07:18:37.031 [http-nio-8081-exec-3] DEBUG com.heartsphere.security.JwtAuthenticationFilter - No JWT token found in request headers
2026-01-30 07:18:37.032 [http-nio-8081-exec-3] INFO  c.heartsphere.security.ApiKeyAuthenticationFilter - No API Key found in request headers
2026-01-30 07:18:37.116 [http-nio-8081-exec-3] INFO  com.heartsphere.service.EmailService - 邮件发送器配置已更新: host=smtp.163.com, port=25, username=tongyexin@163.com, from=tongyexin@163.com
2026-01-30 07:18:37.125 [http-nio-8081-exec-3] INFO  com.heartsphere.aiagent.config.AIConfig - [AIConfig] RestTemplate配置完成 - 最大连接数: 200, 每个路由最大连接数: 50, 连接超时: 30s, 响应超时: 60s
2026-01-30 07:18:37.275 [http-nio-8081-exec-3] ERROR i.n.resolver.dns.DnsServerAddressStreamProviders - Unable to load io.netty.resolver.dns.macos.MacOSDnsServerAddressStreamProvider, fallback to system defaults. This may result in incorrect DNS resolutions on MacOS. Check whether you have a dependency on 'io.netty:netty-resolver-dns-native-macos'. Use DEBUG level to see the full stack: java.lang.UnsatisfiedLinkError: failed to load the required native library
2026-01-30 07:18:37.383 [http-nio-8081-exec-3] INFO  c.heartsphere.aiagent.adapter.ModelAdapterManager - 注册模型适配器: provider=bigmodel
2026-01-30 07:18:37.383 [http-nio-8081-exec-3] INFO  c.heartsphere.aiagent.adapter.ModelAdapterManager - 注册模型适配器: provider=dashscope
2026-01-30 07:18:37.383 [http-nio-8081-exec-3] INFO  c.heartsphere.aiagent.adapter.ModelAdapterManager - 注册模型适配器: provider=doubao
2026-01-30 07:18:37.383 [http-nio-8081-exec-3] INFO  c.heartsphere.aiagent.adapter.ModelAdapterManager - 注册模型适配器: provider=gemini
2026-01-30 07:18:37.383 [http-nio-8081-exec-3] INFO  c.heartsphere.aiagent.adapter.ModelAdapterManager - 注册模型适配器: provider=openai
2026-01-30 07:18:37.383 [http-nio-8081-exec-3] INFO  c.heartsphere.aiagent.adapter.ModelAdapterManager - 共注册 5 个模型适配器
2026-01-30 07:18:37.933 [http-nio-8081-exec-4] DEBUG com.heartsphere.security.JwtAuthenticationFilter - Authorization header found: Bearer eyJhbGciOiJIUzI1NiJ9.ey...
2026-01-30 07:18:37.943 [http-nio-8081-exec-4] DEBUG com.heartsphere.security.JwtAuthenticationFilter - Extracted JWT token length: 173, starts with: eyJhbGciOi
2026-01-30 07:18:37.943 [http-nio-8081-exec-4] DEBUG com.heartsphere.security.JwtAuthenticationFilter - JWT token found in request: eyJhbGciOiJIUzI1NiJ9...
2026-01-30 07:18:37.944 [http-nio-8081-exec-4] DEBUG com.heartsphere.security.JwtAuthenticationFilter - JWT token length: 173, contains dots: 2
2026-01-30 07:18:37.957 [http-nio-8081-exec-4] DEBUG com.heartsphere.security.JwtAuthenticationFilter - JWT token is valid
2026-01-30 07:18:37.957 [http-nio-8081-exec-4] DEBUG com.heartsphere.security.JwtAuthenticationFilter - Extracted username from token: guest_HSMem_API_测试访客_4c41b5fc
2026-01-30 07:18:37.960 [http-nio-8081-exec-4] DEBUG com.heartsphere.security.JwtAuthenticationFilter - Authentication set in SecurityContext for user: guest_HSMem_API_测试访客_4c41b5fc
2026-01-30 07:18:38.088 [http-nio-8081-exec-4] ERROR c.heartsphere.exception.MainGlobalExceptionHandler - 未处理的异常
org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memoryController' defined in file [/Users/admin/Workspace/heartsphere_new/main/backend/target/classes/com/heartsphere/memory/controller/MemoryController.class]: Unsatisfied dependency expressed through constructor parameter 4: No qualifying bean of type 'com.heartsphere.memory.service.hsmem.HSMemApi' available: expected single matching bean but found 2: HSMemClientService,hsmemApiRemote
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:802)
	at org.springframework.beans.factory.support.ConstructorResolver.autowireConstructor(ConstructorResolver.java:241)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.autowireConstructor(AbstractAutowireCapableBeanFactory.java:1356)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1193)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:563)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
	at org.springframework.web.method.HandlerMethod.createWithResolvedBean(HandlerMethod.java:319)
	at org.springframework.web.servlet.handler.AbstractHandlerMethodMapping.getHandlerInternal(AbstractHandlerMethodMapping.java:383)
	at org.springframework.web.servlet.mvc.method.RequestMappingInfoHandlerMapping.getHandlerInternal(RequestMappingInfoHandlerMapping.java:126)
	at org.springframework.web.servlet.mvc.method.RequestMappingInfoHandlerMapping.getHandlerInternal(RequestMappingInfoHandlerMapping.java:68)
	at org.springframework.web.servlet.handler.AbstractHandlerMapping.getHandler(AbstractHandlerMapping.java:507)
	at org.springframework.web.servlet.DispatcherServlet.getHandler(DispatcherServlet.java:1283)
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1065)
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979)
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014)
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903)
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564)
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885)
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:205)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:110)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:110)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365)
	at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126)
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131)
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at com.heartsphere.security.ApiKeyAuthenticationFilter.doFilterInternal(ApiKeyAuthenticationFilter.java:37)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at com.heartsphere.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:75)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107)
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90)
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82)
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374)
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233)
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191)
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352)
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90)
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:340)
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391)
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63)
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896)
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1744)
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.base/java.lang.Thread.run(Thread.java:842)
Caused by: org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'com.heartsphere.memory.service.hsmem.HSMemApi' available: expected single matching bean but found 2: HSMemClientService,hsmemApiRemote
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveNotUnique(DependencyDescriptor.java:218)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1418)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1348)
	at org.springframework.beans.factory.support.ConstructorResolver.resolveAutowiredArgument(ConstructorResolver.java:911)
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:789)
	... 108 common frames omitted

```
