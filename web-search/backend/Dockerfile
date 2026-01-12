FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 复制jar文件
COPY target/web-search-1.0.0.jar app.jar

# 暴露端口
EXPOSE 8086

# 设置JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
