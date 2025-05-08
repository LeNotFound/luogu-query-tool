// index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());

const USERS_PATH = path.resolve(__dirname, './users.json');
const DATA_DIR = path.resolve(__dirname, './data');

// 预加载用户信息
let users = [];
async function loadUsers() {
  const raw = await fs.readFile(USERS_PATH, 'utf-8');
  users = JSON.parse(raw);
}

// 查询接口
app.get('/query/:pid', async (req, res) => {
  const pid = req.params.pid;
  if (!pid) return res.json([]);

  try {
    // 确保用户信息已加载
    if (!users.length) await loadUsers();
    // 处理 uids 参数
    let filterUids = null;
    if (req.query.uids) {
      filterUids = new Set(String(req.query.uids).split(','));
    }
    // 只遍历选中的用户
    const filteredUsers = filterUids ? users.filter(u => filterUids.has(String(u.uid))) : users;
    const results = await Promise.all(filteredUsers.map(async user => {
      const dataPath = path.join(DATA_DIR, `${user.uid}.json`);
      try {
        const raw = await fs.readFile(dataPath, 'utf-8');
        const passedProblems = JSON.parse(raw);
        // 判断是否做过该题
        if (Array.isArray(passedProblems) && passedProblems.some(p => p.pid === pid)) {
          // 返回用户基本信息
          return {
            uid: user.uid,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar
          };
        }
      } catch (e) {
        // 文件不存在或格式错误，忽略
      }
      return null;
    }));

    // 过滤掉未做该题的用户
    res.json(results.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 统一格式的 /users 接口，返回 users.json 内容
app.get('/users', async (req, res) => {
  try {
    const usersPath = path.resolve(__dirname, 'users.json');
    const data = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(data);
    res.json(users.map(u => ({
      uid: u.uid,
      nickname: u.nickname || '',
      name: u.name || '',
      avatar: u.avatar || ''
    })));
  } catch (e) {
    res.status(500).json({ error: '读取用户信息失败' });
  }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;