# Devin Desktop & Devin - Next 简体中文全量汉化插件 (Devin-LanguagePack-zh-CN)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Devin Desktop](https://img.shields.io/badge/Devin%20%2F%20Devin%20Next-%3E%3D1.120.0-6f42c1.svg)](https://github.com/Chun556699/Devin-LanguagePack-zh-CN)
[![Coverage](https://img.shields.io/badge/NLS%20%26%20Chat%20UI%20Coverage-100%25-brightgreen.svg)](https://github.com/Chun556699/Devin-LanguagePack-zh-CN)

专为 **Devin Desktop** 与 **Devin - Next (Beta)**（基于 VS Code `1.126.0` / `1.126.0-next` / Windsurf 架构）打造的 **100% 全量简体中文 (`zh-CN`) 语言包与界面汉化插件**。

彻底解决 Devin Desktop 与 Devin - Next 无法在内置市场搜索中文语言包、官方语言包版本不兼容（`^1.131.0` vs `1.126.0`），以及 **Devin Agent Window、Cascade、Sessions 聊天面板、云端/本地会话、代码审查 (Review) 等专属界面未汉化**的问题。

---

## 核心特性

1. **核心工作台与菜单 100% 汉化（正式版 21,220 / 21,220 词条，Next 版 21,219 / 21,219 词条）**
   - 完整覆盖标准 VS Code 词条以及 Devin / Devin - Next / Windsurf / Sessions / Agent Host / Cloud Session Editor 新增的全部专属核心词条。
   - 完整覆盖全部 **91 个** 内置标准扩展的 `.i18n.json` 中文翻译。
2. **Devin / Devin - Next / Cascade / Sessions 聊天与 AI 界面全量汉化**
   - 内置 `devin-zh-cn-runtime.js` 运行时翻译引擎，在启动阶段自动拦截并汉化 `@exa/chat-client`（`windsurf-chat-client`、`sessions`）与 `@devin/webapp-host`（`devin-webapp-host`）的 `i18next` 语言包（`translation` **4,001 词条** + `review` **265 词条** + `englishOverrides`）。
   - 智能 `MutationObserver` DOM 实时汉化引擎（覆盖 **4,233 条** React 19 JSX 硬编码英文文案及 **44 类** 动态正则句式），完整汉化 Agent Window、Cascade 面板、Agent 会话、收件箱 (Inbox)、看板 (Board)、技能 (Skills)、工作流 (Workflows)、规则 (Rules)、MCP 服务、浏览器预览、代码审查 (Review) 与合并面板等全部专属视图。
   - **安全代码隔离**：自动跳过 Monaco 代码编辑器 (`.monaco-editor`)、终端 (`.xterm`)、`<code>`/`<pre>` 代码块以及用户在输入框中输入的文本，仅汉化界面 UI 与输入框占位提示符 (`placeholder` / `[data-slate-placeholder="true"]`)。
3. **内置 `windsurf*` 扩展清单汉化（100% 覆盖）**
   - 完整汉化 `windsurf`、`windsurf-dev-containers`、`windsurf-remote-devin`、`windsurf-remote-openssh`、`windsurf-remote-wsl` 5 个内置扩展的命令标题、视图名称与配置项说明（同时兼容正式版与 Next 版新增配置）。
4. **自动识别正式版与 Next 版数据目录 & 校验和同步 (`product.json`)**
   - 根据目标安装目录的 `product.json` 自动识别 **Devin**（`%APPDATA%\Devin`、`~/.devin`）与 **Devin - Next**（`%APPDATA%\Devin - Next`、`~/.devin-next`），自动配置 `argv.json`（`"locale": "zh-cn"`）、生成 `languagepacks.json` 与 `clp` 预编译语言包缓存，并自动重算更新 `product.json` 的 SHA-256 校验和，完全消除“安装似乎已损坏 (corrupt installation)”警告。

---

## 快速安装指南

### 方式一：通过 `.vsix` 扩展包安装（通用标准方式）

1. 在本仓库（或 Releases）下载 **[`devin-language-pack-zh-hans-1.126.0.vsix`](./devin-language-pack-zh-hans-1.126.0.vsix)**。
2. 打开 **Devin Desktop** 或 **Devin - Next**，按 `Ctrl+Shift+X`（macOS 为 `Cmd+Shift+X`）打开扩展视图。
3. 点击右上角 `...` 菜单 -> 选择 **从 VSIX 安装... (`Install from VSIX...`)**，选择下载的 `.vsix` 文件。
4. 插件安装激活后会自动配置语言包、生成缓存并应用 UI 补丁，点击右下角弹窗提示的 **立即重新加载 (`Reload Window`)**（或重启客户端）即可完全生效。

### 方式二：克隆仓库一键安装脚本（最快生效，支持同时汉化 Devin 与 Devin Next）

```bash
git clone https://github.com/Chun556699/Devin-LanguagePack-zh-CN.git
cd Devin-LanguagePack-zh-CN
```

- **Windows 用户**：直接双击运行 **`install-zh-cn.bat`**（自动识别系统中的 Devin 与 Devin Next 安装目录，即使未安装 Node.js 也会自动使用 `Devin.exe` 或 `Devin - Next.exe` 内置运行时执行）。
- **命令行 / 自定义安装路径**：
  ```bash
  # 自动检测并汉化系统中安装的 Devin / Devin Next
  node install-zh-cn.js

  # 强制扫描并同时汉化本机所有已安装的 Devin 与 Devin Next：
  node install-zh-cn.js --all

  # 若你的 Devin 或 Devin Next 安装在指定路径，可直接作为参数传入：
  node install-zh-cn.js "E:\Devin"
  node install-zh-cn.js "E:\Devin Next"
  ```
- 启动或重启 **Devin Desktop** / **Devin - Next** 即可直接进入完整简体中文界面。

---

## 命令面板快捷操作 (`Ctrl+Shift+P`)

安装插件后，可在 Devin 命令面板中输入 `Devin 中文` 使用以下命令：

- **`Devin 中文: 启用简体中文并重启 (Enable Simplified Chinese)`** (`devin-zh-cn.enable`)
- **`Devin 中文: 重新应用/修复中文补丁 (Repair Chinese Patch)`** (`devin-zh-cn.repair`) —— 当 Devin 客户端升级后可一键重新应用汉化
- **`Devin 中文: 恢复英文原版并重启 (Restore English)`** (`devin-zh-cn.disable`)

---

## 卸载与恢复英文原版

- **Windows 一键恢复**：双击运行 **`uninstall-zh-cn.bat`**。
- **命令行恢复**：
  ```bash
  node uninstall-zh-cn.js
  # 或指定路径: node uninstall-zh-cn.js "D:\Devin"
  ```
- **命令面板恢复**：在 Devin 中按 `Ctrl+Shift+P` 执行 `Devin 中文: 恢复英文原版并重启 (Restore English)`。

卸载程序会自动从 `.zh-bak` 备份完整还原 `workbench.js`、`sessions.js`、`product.json` 与内置扩展清单，并将 `~/.devin/argv.json` 恢复为 `"en"`。

---

## 目录结构

```text
Devin-LanguagePack-zh-CN/
├── devin-language-pack-zh-hans-1.126.0.vsix  # 可直接安装的预打包 VSIX 扩展文件
├── install-zh-cn.bat                         # Windows 一键安装批处理脚本
├── install-zh-cn.js                          # 跨平台命令行安装脚本
├── uninstall-zh-cn.bat                       # Windows 一键卸载恢复批处理脚本
├── uninstall-zh-cn.js                        # 跨平台命令行卸载恢复脚本
├── extension/                                # 扩展主体与翻译资源
│   ├── package.json                          # 扩展清单（适配 ^1.120.0）
│   ├── extension.js                          # 扩展激活钩子与命令面板注册
│   ├── runtime/
│   │   ├── devin-zh-cn-runtime.js            # i18next 拦截与 React DOM 实时汉化引擎
│   │   ├── windsurf-pkg-zh.json              # 内置 windsurf* 扩展清单汉化字典
│   │   └── patcher.js                        # 语言包缓存编译、补丁注入与校验和同步模块
│   └── translations/
│       ├── main.i18n.json                    # 核心工作台 21,220 词条全量中文包
│       └── extensions/*.i18n.json            # 91 个内置扩展中文语言包
├── LICENSE
└── README.md
```

---

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。基础标准词条源自 [Microsoft/vscode-loc](https://github.com/Microsoft/vscode-loc)（MIT License）。
