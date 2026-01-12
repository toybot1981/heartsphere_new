#!/bin/bash
# 启动脚本：优化DNS配置，解决DNS超时问题

# 设置JVM参数优化DNS解析
export JAVA_OPTS="-Djava.net.preferIPv4Stack=true \
-Dio.netty.resolver.dns.queryTimeoutMillis=30000 \
-Dio.netty.resolver.dns.maxQueriesPerResolve=16 \
-Dio.netty.resolver.dns.recursionDesired=true"

echo "使用优化的DNS配置启动应用..."
echo "JVM参数: $JAVA_OPTS"
echo ""

# 启动Spring Boot应用
mvn spring-boot:run

