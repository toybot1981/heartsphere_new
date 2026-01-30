# API Test Failure Summary

## Failed case
- Case ID: case_1_1
- Case name: GET /api/health
- Step index: 0 (0-based)

## Step
- Method: GET
- Path: /api/health
- Body: (none)

## Error
HTTPConnectionPool(host='localhost', port=8081): Max retries exceeded with url: /api/health (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x102a39940>: Failed to establish a new connection: [Errno 61] Connection refused'))

## Backend log (last lines)

```
[INFO] Scanning for projects...
[INFO] 
[INFO] ----------------< com.heartsphere:heartsphere-service >-----------------
[INFO] Building heartsphere-service 0.0.1-SNAPSHOT
[INFO]   from pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] >>> spring-boot:3.2.0:run (default-cli) > test-compile @ heartsphere-service >>>
[INFO] 
[INFO] --- jacoco:0.8.11:prepare-agent (jacoco-initialize) @ heartsphere-service ---
[INFO] argLine set to -javaagent:/Users/admin/.m2/repository/org/jacoco/org.jacoco.agent/0.8.11/org.jacoco.agent-0.8.11-runtime.jar=destfile=/Users/admin/Workspace/heartsphere_new/main/backend/target/jacoco.exec
[INFO] 
[INFO] --- resources:3.3.1:resources (default-resources) @ heartsphere-service ---
[INFO] Copying 2 resources from src/main/resources to target/classes
[INFO] Copying 160 resources from src/main/resources to target/classes
[INFO] 
[INFO] --- compiler:3.11.0:compile (default-compile) @ heartsphere-service ---
[INFO] Changes detected - recompiling the module! :source
[INFO] Compiling 746 source files with javac [forked debug release 17] to target/classes
[INFO] 
[INFO] --- resources:3.3.1:testResources (default-testResources) @ heartsphere-service ---
[INFO] Copying 5 resources from src/test/resources to target/test-classes
[INFO] 
[INFO] --- compiler:3.11.0:testCompile (default-testCompile) @ heartsphere-service ---
[INFO] Changes detected - recompiling the module! :dependency
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

2026-01-29 21:55:41.646 [main] INFO  com.heartsphere.HeartSphereApplication - Starting HeartSphereApplication using Java 17.0.12 with PID 1955 (/Users/admin/Workspace/heartsphere_new/main/backend/target/classes started by admin in /Users/admin/Workspace/heartsphere_new/main/backend)
2026-01-29 21:55:41.647 [main] INFO  com.heartsphere.HeartSphereApplication - The following 1 profile is active: "dev"
2026-01-29 21:55:42.103 [main] INFO  o.s.d.r.config.RepositoryConfigurationDelegate - Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-01-29 21:55:42.249 [main] INFO  o.s.d.r.config.RepositoryConfigurationDelegate - Finished Spring Data repository scanning in 143 ms. Found 104 JPA repository interfaces.
2026-01-29 21:55:43.210 [main] INFO  o.s.boot.web.embedded.tomcat.TomcatWebServer - Tomcat initialized with port 8081 (http)
2026-01-29 21:55:43.215 [main] INFO  org.apache.catalina.core.StandardService - Starting service [Tomcat]
2026-01-29 21:55:43.215 [main] INFO  org.apache.catalina.core.StandardEngine - Starting Servlet engine: [Apache Tomcat/10.1.16]
2026-01-29 21:55:43.249 [main] INFO  o.a.c.core.ContainerBase.[Tomcat].[localhost].[/] - Initializing Spring embedded WebApplicationContext
2026-01-29 21:55:43.250 [main] INFO  o.s.b.w.s.c.ServletWebServerApplicationContext - Root WebApplicationContext: initialization completed in 1578 ms
2026-01-29 21:55:43.363 [main] INFO  org.hibernate.jpa.internal.util.LogHelper - HHH000204: Processing PersistenceUnitInfo [name: default]
2026-01-29 21:55:43.394 [main] INFO  org.hibernate.Version - HHH000412: Hibernate ORM core version 6.3.1.Final
2026-01-29 21:55:43.421 [main] INFO  o.hibernate.cache.internal.RegionFactoryInitiator - HHH000026: Second-level cache disabled

```
