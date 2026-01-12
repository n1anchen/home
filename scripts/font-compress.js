import fs from 'fs';
import path from 'path';
import Fontmin from 'fontmin';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 字体源目录和输出目录
const fontSourceDir = path.join(__dirname, '../public/font');
const fontOutputDir = path.join(__dirname, '../public/font/compressed');

// 需要包含的文字（从项目中收集）
// 这里包含了常见的中文字符、英文字母和数字
const defaultText = `
abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
0123456789.,!?;:'"-()[]{}@#$%^&*+=/<>~|\\\`_
`;

// 确保输出目录存在
if (!fs.existsSync(fontOutputDir)) {
  fs.mkdirSync(fontOutputDir, { recursive: true });
}

/**
 * 压缩字体文件
 * @param {string} fontPath - 字体文件路径
 * @param {string} text - 需要保留的文字
 */
async function compressFont(fontPath, text) {
  return new Promise((resolve, reject) => {
    const fontName = path.basename(fontPath, path.extname(fontPath));
    const outputPath = path.join(fontOutputDir, fontName);

    console.log(`\n正在处理: ${fontName}`);
    console.log(`输入: ${fontPath}`);
    console.log(`输出: ${outputPath}.woff2`);

    const fontmin = new Fontmin()
      .src(fontPath)
      .dest(fontOutputDir)
      .use(Fontmin.glyph({ text }))
      .use(Fontmin.ttf2woff2());

    fontmin.run((err, files) => {
      if (err) {
        console.error(`✗ ${fontName} 处理失败:`, err);
        reject(err);
        return;
      }

      if (files.length > 0) {
        const originalSize = fs.statSync(fontPath).size;
        const woff2Path = `${outputPath}.woff2`;
        const ttfPath = `${outputPath}.ttf`;
        const compressedSize = fs.statSync(woff2Path).size;
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

        // 删除不需要的 TTF 中间文件，只保留 WOFF2
        if (fs.existsSync(ttfPath)) {
          fs.unlinkSync(ttfPath);
        }

        console.log(`✓ ${fontName} 处理完成`);
        console.log(`  原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`  压缩后: ${(compressedSize / 1024).toFixed(2)} KB`);
        console.log(`  节省空间: ${ratio}%`);

        resolve({
          success: true,
          fontName,
          originalSize,
          compressedSize,
          ratio,
        });
      }
    });
  });
}

/**
 * 从项目源文件中收集所有使用的文字
 */
function collectTextFromProject() {
  let text = defaultText;

  try {
    const srcDir = path.join(__dirname, '../src');
    const files = [];

    // 递归收集所有 .vue .js 文件
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !item.startsWith('.')) {
          walkDir(fullPath);
        } else if (/\.(vue|js)$/.test(item)) {
          files.push(fullPath);
        }
      });
    };

    walkDir(srcDir);

    // 合并所有文件内容
    files.forEach((file) => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        text += content;
      } catch (e) {
        // 忽略读取失败的文件
      }
    });

    // 移除重复的文字
    text = [...new Set(text)].join('');
    console.log(`\n已从项目中收集 ${text.length} 个不同的文字符\n`);
  } catch (e) {
    console.warn('收集项目文字失败，使用默认文字:', e.message);
  }

  return text;
}

/**
 * 主函数
 */
async function main() {
  console.log('====================================');
  console.log('   开始压缩字体文件 (TTF → WOFF2)   ');
  console.log('====================================');

  try {
    // 收集项目中的文字
    const text = collectTextFromProject();

    // 获取所有 TTF 文件
    const ttfFiles = fs.readdirSync(fontSourceDir)
      .filter(file => file.endsWith('.ttf'))
      .map(file => path.join(fontSourceDir, file));

    if (ttfFiles.length === 0) {
      console.warn('⚠ 未找到 TTF 字体文件');
      return;
    }

    console.log(`找到 ${ttfFiles.length} 个 TTF 文件\n`);

    // 处理所有字体文件
    const results = [];
    for (const ttfFile of ttfFiles) {
      try {
        const result = await compressFont(ttfFile, text);
        results.push(result);
      } catch (err) {
        console.error(`处理 ${ttfFile} 失败`, err);
      }
    }

    // 输出总结
    console.log('\n====================================');
    console.log('          处理完成总结');
    console.log('====================================\n');

    let totalOriginal = 0;
    let totalCompressed = 0;

    results.forEach((result) => {
      if (result.success) {
        totalOriginal += result.originalSize;
        totalCompressed += result.compressedSize;
      }
    });

    if (results.length > 0) {
      console.log(`总计:`);
      console.log(`  原始大小: ${(totalOriginal / 1024).toFixed(2)} KB`);
      console.log(`  压缩后: ${(totalCompressed / 1024).toFixed(2)} KB`);
      console.log(`  总节省: ${((1 - totalCompressed / totalOriginal) * 100).toFixed(2)}%\n`);
      console.log(`✓ 字体文件已保存到: ${fontOutputDir}\n`);
    }
  } catch (error) {
    console.error('\n✗ 字体压缩过程出错:', error);
    process.exit(1);
  }
}

main();
