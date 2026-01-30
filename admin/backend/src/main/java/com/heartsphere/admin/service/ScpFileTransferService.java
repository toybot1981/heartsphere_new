package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.RemoteServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.function.Consumer;

/**
 * SCP 文件传输服务
 * 使用 JSch 库实现 SCP 文件传输
 */
@Service
public class ScpFileTransferService {
    
    private static final Logger logger = LoggerFactory.getLogger(ScpFileTransferService.class);
    
    @Autowired(required = false)
    private SshKeyEncryptionService sshKeyEncryptionService;
    
    /**
     * 上传文件到远程服务器
     */
    public void uploadFile(RemoteServer server, String localPath, String remotePath, 
                          Consumer<TransferProgress> progressCallback) throws Exception {
        if (sshKeyEncryptionService == null) {
            throw new RuntimeException("SSH 密钥加密服务未配置");
        }
        
        // 解密 SSH 密钥
        String privateKey = sshKeyEncryptionService.decryptKey(server.getPrivateKey());
        String passphrase = server.getKeyPassphrase() != null 
            ? sshKeyEncryptionService.decryptPassphrase(server.getKeyPassphrase()) 
            : null;
        
        try {
            // 使用 JSch 实现 SCP 传输
            // 注意：需要添加 JSch 依赖到 pom.xml
            uploadFileWithJSch(server, privateKey, passphrase, localPath, remotePath, progressCallback);
        } finally {
            // 清除内存中的密钥
            privateKey = null;
            passphrase = null;
        }
    }
    
    /**
     * 使用 JSch 上传文件
     */
    private void uploadFileWithJSch(RemoteServer server, String privateKey, String passphrase,
                                    String localPath, String remotePath, 
                                    Consumer<TransferProgress> progressCallback) throws Exception {
        // TODO: 实现 JSch SCP 上传
        // 需要添加依赖：com.jcraft:jsch:0.1.55
        // 示例代码：
        /*
        JSch jsch = new JSch();
        jsch.addIdentity("key", privateKey.getBytes(), null, 
            passphrase != null ? passphrase.getBytes() : null);
        
        Session session = jsch.getSession(server.getUsername(), server.getHost(), server.getPort());
        session.setConfig("StrictHostKeyChecking", "no");
        session.connect();
        
        Channel channel = session.openChannel("exec");
        ((ChannelExec) channel).setCommand("scp -t " + remotePath);
        
        channel.setInputStream(new ByteArrayInputStream(("C0644 " + fileSize + " " + fileName + "\n").getBytes()));
        channel.connect();
        
        // 传输文件内容...
        */
        
        // 临时实现：使用系统 scp 命令
        uploadFileWithSystemScp(server, privateKey, passphrase, localPath, remotePath, progressCallback);
    }
    
    /**
     * 使用系统 scp 命令上传文件（临时实现）
     */
    private void uploadFileWithSystemScp(RemoteServer server, String privateKey, String passphrase,
                                         String localPath, String remotePath,
                                         Consumer<TransferProgress> progressCallback) throws Exception {
        Path localFile = Paths.get(localPath);
        if (!Files.exists(localFile)) {
            throw new FileNotFoundException("本地文件不存在: " + localPath);
        }
        
        long fileSize = Files.size(localFile);
        String fileName = localFile.getFileName().toString();
        
        // 创建临时密钥文件
        Path tempKeyFile = Files.createTempFile("ssh_key_", ".tmp");
        try {
            Files.write(tempKeyFile, privateKey.getBytes());
            tempKeyFile.toFile().setReadable(false, false);
            tempKeyFile.toFile().setReadable(true, true);
            
            // 构建 scp 命令
            ProcessBuilder pb = new ProcessBuilder(
                "scp",
                "-i", tempKeyFile.toString(),
                "-P", String.valueOf(server.getPort()),
                "-o", "StrictHostKeyChecking=no",
                "-o", "UserKnownHostsFile=/dev/null",
                localPath,
                server.getUsername() + "@" + server.getHost() + ":" + remotePath
            );
            
            // 设置环境变量（如果需要密码短语，使用 ssh-agent）
            Process process = pb.start();
            
            // 监控传输进度
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                
                String line;
                long transferred = 0;
                while ((line = reader.readLine()) != null) {
                    if (progressCallback != null) {
                        // 简单进度估算（实际应该从 scp 输出解析）
                        transferred += fileSize / 10; // 假设每次读取代表 10% 进度
                        if (transferred > fileSize) transferred = fileSize;
                        progressCallback.accept(new TransferProgress(transferred, fileSize, fileName));
                    }
                }
                
                // 检查错误
                StringBuilder error = new StringBuilder();
                while ((line = errorReader.readLine()) != null) {
                    error.append(line).append("\n");
                }
                
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new IOException("SCP 传输失败: " + error.toString());
                }
            }
        } finally {
            // 删除临时密钥文件
            try {
                Files.deleteIfExists(tempKeyFile);
            } catch (IOException e) {
                logger.warn("Failed to delete temporary key file", e);
            }
        }
    }
    
    /**
     * 同步目录到远程服务器
     */
    public void syncDirectory(RemoteServer server, String localDir, String remoteDir,
                              Consumer<TransferProgress> progressCallback) throws Exception {
        // TODO: 实现目录同步
        // 可以递归上传目录中的所有文件
        throw new UnsupportedOperationException("目录同步功能待实现");
    }
    
    /**
     * 测试服务器连接
     */
    public boolean testConnection(RemoteServer server) {
        try {
            if (sshKeyEncryptionService == null) {
                return false;
            }
            
            String privateKey = sshKeyEncryptionService.decryptKey(server.getPrivateKey());
            String passphrase = server.getKeyPassphrase() != null 
                ? sshKeyEncryptionService.decryptPassphrase(server.getKeyPassphrase()) 
                : null;
            
            try {
                // 使用 ssh 命令测试连接
                ProcessBuilder pb = new ProcessBuilder(
                    "ssh",
                    "-i", createTempKeyFile(privateKey).toString(),
                    "-p", String.valueOf(server.getPort()),
                    "-o", "StrictHostKeyChecking=no",
                    "-o", "ConnectTimeout=5",
                    server.getUsername() + "@" + server.getHost(),
                    "echo 'Connection successful'"
                );
                
                Process process = pb.start();
                int exitCode = process.waitFor();
                return exitCode == 0;
            } finally {
                // 清除内存中的密钥
                privateKey = null;
                passphrase = null;
            }
        } catch (Exception e) {
            logger.error("Connection test failed", e);
            return false;
        }
    }
    
    /**
     * 创建临时密钥文件
     */
    private Path createTempKeyFile(String privateKey) throws IOException {
        Path tempKeyFile = Files.createTempFile("ssh_key_", ".tmp");
        Files.write(tempKeyFile, privateKey.getBytes());
        tempKeyFile.toFile().setReadable(false, false);
        tempKeyFile.toFile().setReadable(true, true);
        return tempKeyFile;
    }
    
    /**
     * 传输进度信息
     */
    public static class TransferProgress {
        private final long transferred;
        private final long total;
        private final String fileName;
        
        public TransferProgress(long transferred, long total, String fileName) {
            this.transferred = transferred;
            this.total = total;
            this.fileName = fileName;
        }
        
        public long getTransferred() {
            return transferred;
        }
        
        public long getTotal() {
            return total;
        }
        
        public String getFileName() {
            return fileName;
        }
        
        public double getProgress() {
            return total > 0 ? (double) transferred / total : 0.0;
        }
        
        public String getProgressPercent() {
            return String.format("%.1f%%", getProgress() * 100);
        }
    }
}
