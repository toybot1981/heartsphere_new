# Pandoc安装说明

## 当前情况

检测到您的系统是ARM64（Apple Silicon），但Homebrew安装在Intel默认前缀(/usr/local)，导致无法直接安装Pandoc。

## 解决方案

### 方案1：安装ARM版本的Homebrew（推荐）

**步骤：**

1. 打开终端，运行以下命令安装ARM版本的Homebrew：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. 按照提示完成安装（可能需要输入密码）

3. 安装完成后，将ARM Homebrew添加到PATH：

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

4. 验证安装：

```bash
brew --version
```

5. 安装Pandoc：

```bash
brew install pandoc
```

6. 验证Pandoc安装：

```bash
pandoc --version
```

### 方案2：使用Conda安装（如果已安装Conda）

```bash
# 使用conda安装
conda install -c conda-forge pandoc

# 或使用mamba（更快）
mamba install -c conda-forge pandoc
```

### 方案3：使用Typora（图形界面，推荐）

如果安装Pandoc遇到困难，可以使用Typora：

1. **下载Typora**：
   - 访问：https://typora.io/
   - 下载macOS版本
   - 安装Typora

2. **使用Typora转换**：
   - 打开Typora
   - 打开Markdown文件（如`main-client/软件说明书.md`）
   - 点击"文件" > "导出" > "Word (.docx)"
   - 保存为Word文档

**优点**：
- 图形界面，操作简单
- 无需命令行操作
- 支持实时预览
- 转换质量好

### 方案4：使用在线转换工具

如果以上方法都不方便，可以使用在线转换工具：

1. **CloudConvert**：https://cloudconvert.com/md-to-docx
   - 上传Markdown文件
   - 选择转换为Word格式
   - 下载转换后的文件

2. **Convertio**：https://convertio.co/md-docx/
   - 上传Markdown文件
   - 转换为Word格式
   - 下载文件

**注意**：在线工具可能对文件大小有限制，且需要网络连接。

## 推荐方案

根据当前情况，推荐使用**方案3（Typora）**：

1. **简单易用**：图形界面，无需命令行
2. **转换质量好**：转换后的Word文档格式良好
3. **无需配置**：安装后即可使用
4. **支持预览**：可以实时预览Markdown效果

## 安装Typora后的使用步骤

1. 打开Typora
2. 打开 `copyright-materials/main-client/软件说明书.md`
3. 点击"文件" > "导出" > "Word (.docx)"
4. 保存为 `main-client/软件说明书.docx`
5. 重复以上步骤转换其他产品
6. 在Word中打开转换后的文档，按照 `Word模板设置说明.md` 调整格式

## 验证安装

无论使用哪种方案，安装完成后请验证：

```bash
# 如果使用Pandoc
pandoc --version

# 应该显示类似：
# pandoc 3.x.x
# Compiled with pandoc-types 1.x.x, ...
```

## 下一步

安装完成后，请参考：
- `开始转换工作.md` - 快速开始指南
- `安装和转换步骤.md` - 详细的转换步骤
- `格式转换指南.md` - 完整的转换指南

---

**最后更新**：2025-01-11
