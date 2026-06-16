# MD Chrome 新标签页

一个现代化的浏览器首页导航插件，支持自定义壁纸、搜索引擎选择和快捷工具管理。

## ✨ 功能特性

- 🎨 **自定义壁纸**
  - 默认渐变背景
  - 纯色背景（颜色选择器）
  - 自定义图片（支持本地上传和网址）
  
- 🔍 **智能搜索**
  - 支持多个搜索引擎（百度、Google、Bing）
  - 根据时间显示问候语
  
- 🚀 **快捷工具**
  - 自定义快捷链接
  - 支持 Emoji 图标
  - 拖拽编辑和删除

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3
- **图标**: Lucide React
- **存储**: Chrome Storage API

## 📦 安装与使用

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

在浏览器中访问 `http://localhost:5173` 预览效果。

### 3. 构建生产版本

```bash
npm run build
```

构建完成后，`dist` 目录中将包含可用的扩展文件。

### 4. 加载到 Chrome

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录
5. 打开新标签页即可看到效果

## 📁 项目结构

```
md-chrome/
├── public/
│   └── manifest.json          # Chrome 扩展配置
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx      # 搜索栏组件
│   │   ├── QuickLinks.tsx     # 快捷链接组件
│   │   └── SettingsPanel.tsx  # 设置面板组件
│   ├── App.tsx                # 主应用组件
│   ├── main.tsx               # 入口文件
│   ├── index.css              # 全局样式
│   ├── types.ts               # TypeScript 类型定义
│   └── utils.ts               # 工具函数
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 使用说明

### 设置壁纸

1. 点击右上角设置按钮
2. 在"壁纸设置"标签页中选择：
   - 默认渐变：使用系统预设的紫色渐变
   - 纯色背景：选择任意颜色
   - 自定义壁纸：上传本地图片或输入网址

### 切换搜索引擎

1. 点击设置按钮
2. 切换到"搜索引擎"标签页
3. 选择你喜欢的搜索引擎

### 管理快捷链接

- **添加**：点击"+"图标，填写标题、网址和 Emoji
- **编辑**：鼠标悬停在链接上，点击编辑图标
- **删除**：鼠标悬停在链接上，点击删除图标

## 🔧 开发命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产版本
- `npm run lint` - 运行 ESLint 检查

## 📝 待改进

- [ ] 添加更多搜索引擎选项
- [ ] 支持快捷链接拖拽排序
- [ ] 添加天气小组件
- [ ] 支持更多壁纸来源（Unsplash API）
- [ ] 添加时钟小组件
- [ ] 支持快捷键操作

## 📄 许可

MIT License
