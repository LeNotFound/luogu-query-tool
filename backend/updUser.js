const fs = require('fs');
const https = require('https');
const path = require('path');

const usersPath = path.join(__dirname, 'users.json');
const cookiesPath = path.join(__dirname, 'www.luogu.com.cn_cookies.txt');
const teamId = process.argv[2] || '50877';
const url = `https://www.luogu.com.cn/api/team/members/${teamId}?limit=100&orderBy=group.no&page=1`;

function getCookieString(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  return lines
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const parts = line.split('\t');
      return parts.length >= 7 ? `${parts[5]}=${parts[6]}` : '';
    })
    .filter(Boolean)
    .join('; ');
}

function fetchTeamJson(url, callback) {
  const cookie = getCookieString(cookiesPath);
  const options = {
    headers: {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  };
  https.get(url, options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      callback(JSON.parse(data));
    });
  }).on('error', err => {
    console.error('请求失败:', err);
  });
}

function updateUsers(teamData) {
  const members = teamData.members.result;
  const users = members.map(m => ({
    name: m.realName && m.realName.trim() ? m.realName : m.user.name,
    uid: String(m.user.uid),
    nickname: m.user.name,
    avatar: m.user.avatar
  }));
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
  console.log('users.json 已更新');
}

fetchTeamJson(url, updateUsers);
