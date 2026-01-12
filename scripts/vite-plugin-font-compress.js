import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vite 插件：在构建前自动压缩字体文件
 */
export default function viteFontCompressPlugin(options = {}) {
  return {
    name: 'vite-plugin-font-compress',
    apply: 'build',
    enforce: 'pre',

    async configResolved(config) {
      this.config = config;
    },

    async buildStart() {
      try {
        console.log('\n🔤 开始压缩字体文件...\n');

        const scriptPath = path.join(__dirname, 'font-compress.js');
        execSync(`node ${scriptPath}`, {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..'),
        });

        console.log('\n✓ 字体压缩完成\n');
      } catch (error) {
        if (options.failOnError !== false) {
          console.error('\n✗ 字体压缩失败:', error.message);
          throw new Error('字体压缩流程失败');
        } else {
          console.warn('\n⚠ 字体压缩失败，继续构建:', error.message);
        }
      }
    },
  };
}
