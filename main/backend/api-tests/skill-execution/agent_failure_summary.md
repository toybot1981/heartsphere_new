# API Test Failure Summary

## Failed case
- Case ID: case_execute_post
- Case name: POST 执行技能
- Step index: 0 (0-based)

## Step
- Method: POST
- Path: /api/skills/execute
- Body: {"skillId": "test-skill", "characterId": null, "parameters": {}, "additionalContext": null}

## Error
HTTPConnectionPool(host='localhost', port=8081): Max retries exceeded with url: /api/skills/execute (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x1066c1940>: Failed to establish a new connection: [Errno 61] Connection refused'))

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
[INFO] -------------------------------------------------------------
[ERROR] COMPILATION ERROR : 
[INFO] -------------------------------------------------------------
[ERROR] /Users/admin/Workspace/heartsphere_new/main/backend/src/main/java/com/heartsphere/service/GuestInitializationService.java:[70,12] 错误: 对Character的引用不明确
  com.heartsphere.entity 中的类 com.heartsphere.entity.Character 和 java.lang 中的类 java.lang.Character 都匹配
[ERROR] /Users/admin/Workspace/heartsphere_new/main/backend/src/main/java/com/heartsphere/service/GuestInitializationService.java:[70,31] 错误: 对Character的引用不明确
  com.heartsphere.entity 中的类 com.heartsphere.entity.Character 和 java.lang 中的类 java.lang.Character 都匹配
[INFO] 2 errors 
[INFO] -------------------------------------------------------------
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  02:07 min
[INFO] Finished at: 2026-01-29T21:20:48+08:00
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.11.0:compile (default-compile) on project heartsphere-service: Compilation failure: Compilation failure: 
[ERROR] /Users/admin/Workspace/heartsphere_new/main/backend/src/main/java/com/heartsphere/service/GuestInitializationService.java:[70,12] 错误: 对Character的引用不明确
[ERROR]   com.heartsphere.entity 中的类 com.heartsphere.entity.Character 和 java.lang 中的类 java.lang.Character 都匹配
[ERROR] /Users/admin/Workspace/heartsphere_new/main/backend/src/main/java/com/heartsphere/service/GuestInitializationService.java:[70,31] 错误: 对Character的引用不明确
[ERROR]   com.heartsphere.entity 中的类 com.heartsphere.entity.Character 和 java.lang 中的类 java.lang.Character 都匹配
[ERROR] -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoFailureException

```
