// 快速生成 BCrypt 密码的 Java 程序
// 编译: javac -cp ".:path/to/spring-security-crypto.jar" generate_bcrypt_password.java
// 运行: java -cp ".:path/to/spring-security-crypto.jar" GenerateBcryptPassword <password>

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBcryptPassword {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Usage: java GenerateBcryptPassword <password>");
            System.exit(1);
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encoded = encoder.encode(args[0]);
        System.out.println(encoded);
    }
}
