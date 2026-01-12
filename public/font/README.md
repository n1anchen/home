# 字体压缩

该目录下的字体会压缩为 `woff2` 格式以减小体积。

## 使用方式

### 方式 1：手动执行

```bash
pnpm compress-fonts
```

### 方式 2：自动执行（推荐）

在执行 `pnpm build` 时，插件会自动在构建前压缩字体文件。

## 配置修改

如需修改字体压缩的默认行为：

### 添加额外的文字

编辑 `scripts/font-compress.js` 中的 `defaultText` 变量：

```javascript
const defaultText = `
你好世界Hello World
// 添加更多文字...
`;
```

### 禁用失败时的构建中断

在 `vite.config.js` 中修改插件配置：

```javascript
viteFontCompress({ failOnError: false })
```

## 依赖

- **fontmin** - 字体处理库，用于提取和转换字体

## 浏览器兼容性

WOFF2 格式支持：
- Chrome 36+
- Firefox 39+
- Edge 15+
- Safari 12+

对于需要兼容旧浏览器的项目，可以保留原始 TTF 文件作为备选。

## 优化建议

1. **定期更新** - 项目内容更新后，重新运行脚本以获得最优的文件大小
2. **查看日志** - 注意压缩率统计，如果某个字体压缩率异常低，可能是包含了过多未使用的文字
3. **使用 CDN** - WOFF2 文件可以配合 CDN 和缓存策略进一步优化加载速度

## 常见问题

**Q: 如何使用压缩后的字体？**

A: 更新你的 CSS 中的 `@font-face` 指向 `public/font/compressed/` 目录中的 `.woff2` 文件。

**Q: 处理失败怎么办？**

A: 检查 TTF 文件是否损坏，或尝试更新 `fontmin` 库：`pnpm update fontmin`

**Q: 脚本没有处理某些文字？**

A: 确保这些文字出现在项目的 `.vue` 或 `.js` 文件中，脚本会自动扫描这些文件。
