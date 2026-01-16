package com.heartsphere.mobile;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity for Android
 * 
 * 注意：此应用使用构建脚本 (scripts/build-android.sh) 在同步到 Android 之前
 * 将 mobile.html 复制为 index.html，因此这里不需要特殊处理。
 * 
 * 如果直接使用 npx cap sync，请使用 npm run cap:build:android 命令。
 */
public class MainActivity extends BridgeActivity {
    // 使用默认的 BridgeActivity 实现即可
    // 构建脚本已经将 mobile.html 复制为 index.html
}
