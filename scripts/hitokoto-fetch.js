import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * 从数据数组中随机抽取指定数量的项
 * @param {Array} arr 源数组
 * @param {number} count 抽取数量
 * @returns {Array} 抽取的项
 */
function randomSample(arr, count) {
  const result = [];
  const indices = new Set();

  while (indices.size < Math.min(count, arr.length)) {
    indices.add(Math.floor(Math.random() * arr.length));
  }

  indices.forEach((idx) => {
    result.push(arr[idx]);
  });

  return result;
}

/**
 * 生成一言数据文件
 * 从 public/hitokoto/a.json 中随机抽取100条数据
 */
export function generateHitokotoData() {
  try {
    // 读取原始数据
    const sourceFile = resolve(__dirname, "../public/hitokoto/a.json");
    const rawData = readFileSync(sourceFile, "utf-8");
    const allData = JSON.parse(rawData);

    // 随机抽取100条数据
    const selectedData = randomSample(allData, 100);

    // 格式化数据为所需格式
    const formattedData = selectedData.map((item) => ({
      text: item.hitokoto,
      from: item.from,
    }));

    // 写入输出文件到 public 目录
    const outputFile = resolve(__dirname, "../public/hitokoto-data.json");
    writeFileSync(outputFile, JSON.stringify(formattedData, null, 2), "utf-8");

    console.log(`✓ 一言数据生成成功: 已抽取 ${formattedData.length} 条数据到 ${outputFile}`);
    return formattedData;
  } catch (error) {
    console.error("✗ 一言数据生成失败:", error);
    throw error;
  }
}

// 直接调用时执行
generateHitokotoData();
