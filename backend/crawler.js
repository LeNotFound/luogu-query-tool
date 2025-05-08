// crawler.js
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

/**
 * 随机延迟
 * @param {number} min 最小毫秒
 * @param {number} max 最大毫秒
 */
function sleep(min, max) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // 1. 读取用户列表
  const usersPath = path.resolve(__dirname, './users.json');
  console.log('读取用户列表:', usersPath);
  const usersRaw = await fs.readFile(usersPath, 'utf-8');
  const users = JSON.parse(usersRaw);
  console.log('用户列表:', users);

  // 2. 确保 data 目录存在
  const dataDir = path.resolve(__dirname, './data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('已确保 data 目录存在:', dataDir);
  } catch (e) {
    console.warn('创建 data 目录时出错:', e.message);
  }

  // 3. 遍历用户
  for (const user of users) {
    const url = `https://www.luogu.com.cn/user/${user.uid}?_contentOnly=1`;
    console.log('请求 URL:', url);
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; crawler/1.0; +https://github.com/)',
        },
        timeout: 10000,
      });
      console.log(`用户 ${user.uid} 返回数据:`, JSON.stringify(res.data).slice(0, 200) + '...');
      const passedProblems = res.data?.currentData?.passedProblems;
      if (!passedProblems) {
        console.warn(`用户 ${user.uid} 没有获取到 passedProblems 字段`);
        continue;
      }
      // 4. 保存为 ./data/{uid}.json
      const outPath = path.join(dataDir, `${user.uid}.json`);
      await fs.writeFile(outPath, JSON.stringify(passedProblems, null, 2), 'utf-8');
      console.log(`已保存 ${user.uid}.json`);
    } catch (err) {
      console.error(`抓取用户 ${user.uid} 失败:`, err.message);
    }
    // 5. 随机延迟 100~300ms
    await sleep(100, 300);
  }
}

// 仅当直接运行 crawler.js 时才自动执行 main()
if (require.main === module) {
  main();
}

module.exports = main;