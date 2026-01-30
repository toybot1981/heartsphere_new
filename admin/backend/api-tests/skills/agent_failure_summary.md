# API Test Failure Summary

## Failed case
- Case ID: case_get_all
- Case name: GET 技能列表
- Step index: 0 (0-based)

## Step
- Method: GET
- Path: /api/admin/skills
- Body: (none)

## Error
HTTPConnectionPool(host='localhost', port=8085): Max retries exceeded with url: /api/admin/skills (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x11142d940>: Failed to establish a new connection: [Errno 61] Connection refused'))

## Backend log (last lines)

```
[INFO] >>> spring-boot:3.2.0:run (default-cli) > test-compile @ heartsphere-admin-service >>>
[INFO] 
[INFO] --- resources:3.3.1:resources (default-resources) @ heartsphere-admin-service ---
[INFO] Copying 1 resource from src/main/resources to target/classes
[INFO] Copying 7 resources from src/main/resources to target/classes
[INFO] 
[INFO] --- compiler:3.11.0:compile (default-compile) @ heartsphere-admin-service ---
[INFO] Nothing to compile - all classes are up to date
[INFO] 
[INFO] --- resources:3.3.1:testResources (default-testResources) @ heartsphere-admin-service ---
[INFO] Copying 1 resource from src/test/resources to target/test-classes
[INFO] 
[INFO] --- compiler:3.11.0:testCompile (default-testCompile) @ heartsphere-admin-service ---
[INFO] Nothing to compile - all classes are up to date
[INFO] 
[INFO] <<< spring-boot:3.2.0:run (default-cli) < test-compile @ heartsphere-admin-service <<<
[INFO] 
[INFO] 
[INFO] --- spring-boot:3.2.0:run (default-cli) @ heartsphere-admin-service ---
[INFO] Attaching agents: []

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

2026-01-29 21:18:59 [main] INFO  c.heartsphere.admin.AdminApplication - Starting AdminApplication using Java 17.0.12 with PID 28882 (/Users/admin/Workspace/heartsphere_new/admin/backend/target/classes started by admin in /Users/admin/Workspace/heartsphere_new/admin/backend)
2026-01-29 21:18:59 [main] INFO  c.heartsphere.admin.AdminApplication - The following 1 profile is active: "dev"
2026-01-29 21:19:03 [main] INFO  o.s.d.r.c.RepositoryConfigurationDelegate - Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-01-29 21:19:04 [main] INFO  o.s.d.r.c.RepositoryConfigurationDelegate - Finished Spring Data repository scanning in 374 ms. Found 79 JPA repository interfaces.
2026-01-29 21:19:13 [main] INFO  o.s.b.w.e.tomcat.TomcatWebServer - Tomcat initialized with port 8085 (http)
2026-01-29 21:19:13 [main] INFO  o.a.catalina.core.StandardService - Starting service [Tomcat]
2026-01-29 21:19:13 [main] INFO  o.a.catalina.core.StandardEngine - Starting Servlet engine: [Apache Tomcat/10.1.16]
2026-01-29 21:19:15 [main] INFO  o.a.c.c.C.[Tomcat].[localhost].[/] - Initializing Spring embedded WebApplicationContext
2026-01-29 21:19:15 [main] INFO  o.s.b.w.s.c.ServletWebServerApplicationContext - Root WebApplicationContext: initialization completed in 15754 ms
2026-01-29 21:19:16 [main] ERROR o.s.b.w.e.tomcat.TomcatStarter - Error starting Tomcat context. Exception: org.springframework.beans.factory.UnsatisfiedDependencyException. Message: Error creating bean with name 'apiKeyAuthenticationFilter': Unsatisfied dependency expressed through field 'apiKeyService': Error creating bean with name 'apiKeyService': Unsatisfied dependency expressed through field 'apiKeyRepository': Error creating bean with name 'apiKeyRepository' defined in com.heartsphere.admin.repository.ApiKeyRepository defined in @EnableJpaRepositories declared on JpaConfig: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
2026-01-29 21:19:16 [main] INFO  o.a.catalina.core.StandardService - Stopping service [Tomcat]
2026-01-29 21:19:16 [main] WARN  o.s.b.w.s.c.AnnotationConfigServletWebServerApplicationContext - Exception encountered during context initialization - cancelling refresh attempt: org.springframework.context.ApplicationContextException: Unable to start web server
2026-01-29 21:19:16 [main] INFO  o.s.b.a.l.ConditionEvaluationReportLogger - 

Error starting ApplicationContext. To display the condition evaluation report re-run your application with 'debug' enabled.
2026-01-29 21:19:17 [main] ERROR o.s.boot.SpringApplication - Application run failed
org.springframework.context.ApplicationContextException: Unable to start web server
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.onRefresh(ServletWebServerApplicationContext.java:165)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:610)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:146)
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:753)
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:455)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:323)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1342)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1331)
	at com.heartsphere.admin.AdminApplication.main(AdminApplication.java:21)
Caused by: org.springframework.boot.web.server.WebServerException: Unable to start embedded Tomcat
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.initialize(TomcatWebServer.java:142)
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.<init>(TomcatWebServer.java:104)
	at org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory.getTomcatWebServer(TomcatServletWebServerFactory.java:501)
	at org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory.getWebServer(TomcatServletWebServerFactory.java:218)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.createWebServer(ServletWebServerApplicationContext.java:188)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.onRefresh(ServletWebServerApplicationContext.java:162)
	... 8 common frames omitted
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'apiKeyAuthenticationFilter': Unsatisfied dependency expressed through field 'apiKeyService': Error creating bean with name 'apiKeyService': Unsatisfied dependency expressed through field 'apiKeyRepository': Error creating bean with name 'apiKeyRepository' defined in com.heartsphere.admin.repository.ApiKeyRepository defined in @EnableJpaRepositories declared on JpaConfig: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:772)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:752)
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:145)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessProperties(AutowiredAnnotationBeanPostProcessor.java:493)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1420)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:600)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.getOrderedBeansOfType(ServletContextInitializerBeans.java:210)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.addAsRegistrationBean(ServletContextInitializerBeans.java:173)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.addAsRegistrationBean(ServletContextInitializerBeans.java:168)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.addAdaptableBeans(ServletContextInitializerBeans.java:153)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.<init>(ServletContextInitializerBeans.java:86)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.getServletContextInitializerBeans(ServletWebServerApplicationContext.java:266)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.selfInitialize(ServletWebServerApplicationContext.java:240)
	at org.springframework.boot.web.embedded.tomcat.TomcatStarter.onStartup(TomcatStarter.java:52)
	at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:4850)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1332)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1322)
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:264)
	at org.apache.tomcat.util.threads.InlineExecutorService.execute(InlineExecutorService.java:75)
	at java.base/java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:145)
	at org.apache.catalina.core.ContainerBase.startInternal(ContainerBase.java:866)
	at org.apache.catalina.core.StandardHost.startInternal(StandardHost.java:845)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1332)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1322)
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:264)
	at org.apache.tomcat.util.threads.InlineExecutorService.execute(InlineExecutorService.java:75)
	at java.base/java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:145)
	at org.apache.catalina.core.ContainerBase.startInternal(ContainerBase.java:866)
	at org.apache.catalina.core.StandardEngine.startInternal(StandardEngine.java:240)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171)
	at org.apache.catalina.core.StandardService.startInternal(StandardService.java:433)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171)
	at org.apache.catalina.core.StandardServer.startInternal(StandardServer.java:917)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171)
	at org.apache.catalina.startup.Tomcat.start(Tomcat.java:488)
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.initialize(TomcatWebServer.java:123)
	... 13 common frames omitted
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'apiKeyService': Unsatisfied dependency expressed through field 'apiKeyRepository': Error creating bean with name 'apiKeyRepository' defined in com.heartsphere.admin.repository.ApiKeyRepository defined in @EnableJpaRepositories declared on JpaConfig: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:772)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:752)
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:145)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessProperties(AutowiredAnnotationBeanPostProcessor.java:493)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1420)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:600)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:254)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1441)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1348)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:769)
	... 55 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'apiKeyRepository' defined in com.heartsphere.admin.repository.ApiKeyRepository defined in @EnableJpaRepositories declared on JpaConfig: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:377)
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveValueIfNecessary(BeanDefinitionValueResolver.java:135)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.applyPropertyValues(AbstractAutowireCapableBeanFactory.java:1686)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1435)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:600)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:254)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1441)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1348)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.resolveFieldValue(AutowiredAnnotationBeanPostProcessor.java:769)
	... 69 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'jpaSharedEM_entityManagerFactory': Cannot resolve reference to bean 'entityManagerFactory' while setting constructor argument
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:377)
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveValueIfNecessary(BeanDefinitionValueResolver.java:135)
	at org.springframework.beans.factory.support.ConstructorResolver.resolveConstructorArguments(ConstructorResolver.java:689)
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:513)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1336)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1166)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:563)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:365)
	... 82 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'flyway' defined in class path resource [org/springframework/boot/autoconfigure/flyway/FlywayAutoConfiguration$FlywayConfiguration.class]: Failed to instantiate [org.flywaydb.core.Flyway]: Factory method 'flyway' threw exception with message: No qualifying bean of type 'javax.sql.DataSource' available: more than one 'primary' bean found among candidates: [adminDataSource, mentisDataSource, eduDataSource, agentMindDataSource, routingDataSource]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:655)
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:643)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1336)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1166)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:563)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:325)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:323)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:312)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:365)
	... 94 common frames omitted
Caused by: org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.flywaydb.core.Flyway]: Factory method 'flyway' threw exception with message: No qualifying bean of type 'javax.sql.DataSource' available: more than one 'primary' bean found among candidates: [adminDataSource, mentisDataSource, eduDataSource, agentMindDataSource, routingDataSource]
	at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:178)
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:651)
	... 106 common frames omitted
Caused by: org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'javax.sql.DataSource' available: more than one 'primary' bean found among candidates: [adminDataSource, mentisDataSource, eduDataSource, agentMindDataSource, routingDataSource]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.determinePrimaryCandidate(DefaultListableBeanFactory.java:1753)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.determineAutowireCandidate(DefaultListableBeanFactory.java:1713)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1414)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory$DependencyObjectProvider.getIfUnique(DefaultListableBeanFactory.java:2151)
	at org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration$FlywayConfiguration.flyway(FlywayAutoConfiguration.java:172)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.base/java.lang.reflect.Method.invoke(Method.java:568)
	at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:140)
	... 107 common frames omitted
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  33.387 s
[INFO] Finished at: 2026-01-29T21:19:17+08:00
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal org.springframework.boot:spring-boot-maven-plugin:3.2.0:run (default-cli) on project heartsphere-admin-service: Process terminated with exit code: 1 -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoExecutionException

```
