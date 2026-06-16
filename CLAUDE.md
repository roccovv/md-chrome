# MD Chrome 新标签页

一个现代化的浏览器首页导航插件项目。

## 技术栈

- **框架**: Vite + React 18 + TypeScript
- **样式**: Tailwind CSS 3
- **图标**: Lucide React
- **构建工具**: Vite 5
- **存储**: Chrome Storage API / LocalStorage

## 项目结构

```
src/
├── components/          # React 组件
│   ├── SearchBar.tsx   # 搜索栏组件
│   ├── QuickLinks.tsx  # 快捷链接工具区
│   └── SettingsPanel.tsx # 设置面板
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
├── types.ts            # TypeScript 类型定义
├── utils.ts            # 工具函数（设置存储）
└── index.css           # 全局样式
```

## 功能特性

### 1. 壁纸系统
- 默认渐变背景
- 纯色背景（带颜色选择器）
- 自定义图片（支持本地上传和 URL）
- 使用 Chrome Storage API 持久化

### 2. 搜索区
- 支持多搜索引擎（百度、Google、Bing）
- 根据时间显示问候语（早上好/下午好/晚上好）
- 响应式搜索框设计

### 3. 工具区（快捷链接）
- 自定义快捷链接
- 支持 Emoji 图标
- 可编辑、删除快捷方式
- 响应式网格布局

### 4. 设置面板
- 壁纸设置
- 搜索引擎切换
- 滑动式面板设计

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## Chrome 扩展加载

1. 运行 `npm run build` 构建项目
2. 打开 Chrome 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 目录

## 设置持久化

- 优先使用 Chrome Storage API（扩展环境）
- 降级到 LocalStorage（开发环境）
- 存储内容：壁纸设置、搜索引擎、快捷链接

## 注意事项

- 项目使用 ES Module 规范
- 需要 Node.js 18+ 环境
- Tailwind CSS 采用 JIT 模式
- 图标库使用 Lucide React（轻量级）
- pnpm 作为依赖管理工具
