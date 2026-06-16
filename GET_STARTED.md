# 快速开始指南

## 环境要求

- Node.js 18+ 
- npm 或 pnpm

## 安装步骤

### 1. 安装依赖

在项目根目录下运行：

```bash
npm install
```

或使用 pnpm（推荐，更快）：

```bash
pnpm install
```

### 2. 开发模式

启动开发服务器进行预览：

```bash
npm run dev
```

然后在浏览器中访问 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

构建完成后，`dist` 目录将包含可用的 Chrome 扩展文件。

### 4. 加载到 Chrome 浏览器

1. 打开 Chrome，访问 `chrome://extensions/`
2. 右上角开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录
5. 打开新标签页，即可看到你的首页导航

## 准备图标（重要）

在构建前，需要在 `public/icons/` 目录下添加图标文件：

- `icon16.png` - 16x16 像素
- `icon48.png` - 48x48 像素
- `icon128.png` - 128x128 像素

**临时方案**：可以先使用任意 PNG 图片复制并重命名为这些文件名，后续再替换为正式图标。

## 项目特点

✅ **现代化技术栈**
- React 18 + TypeScript
- Vite 构建工具（极速开发体验）
- Tailwind CSS（实用优先的样式）

✅ **完整功能**
- 自定义壁纸（默认渐变/纯色/自定义图片）
- 多搜索引擎支持
- 快捷链接管理
- 数据持久化存储

✅ **开发友好**
- 热模块替换（HMR）
- TypeScript 类型安全
- ESLint 代码检查

## 常见问题

**Q: 开发模式下存储的数据会丢失吗？**

A: 开发模式使用 LocalStorage，数据会保留。加载到 Chrome 后使用 Chrome Storage API，更加可靠。

**Q: 如何自定义搜索引擎？**

A: 编辑 `src/utils.ts` 中的 `DEFAULT_SEARCH_ENGINES` 数组，添加你想要的搜索引擎。

**Q: 壁纸图片如何存储？**

A: 本地上传的图片会转换为 Base64 存储在 Chrome Storage 中。如果图片过大，建议使用图床链接。

## 下一步

- 运行 `npm install` 安装依赖
- 运行 `npm run dev` 开始开发
- 根据需要修改样式和功能
- 构建并加载到 Chrome 测试

祝开发愉快！🚀
