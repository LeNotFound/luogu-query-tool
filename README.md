# Luogu Query Tool

## 项目简介

**Luogu Query Tool** 是一个用于查询洛谷用户做题情况的全栈工具，支持通过题号快速查看指定用户是否做过该题，并提供美观直观的查询界面。

本项目包含：
- 前端：基于 **Vue 3 + Vite**，支持实时交互与动画效果。
- 后端：基于 **Node.js + Express**，用于提供题号查询接口与本地缓存。

## 目录结构

```

luogu-query-tool/
├── backend/     # Node.js 后端服务
│   ├── data/    # 存放各用户的做题记录（uid.json）
│   ├── users.json  # 存放用户信息（uid、姓名、昵称、头像链接）
│   └── index.js # 后端主服务
├── frontend/    # Vue3 + Vite 前端项目
│   └── src/App.vue 等组件
└── README.md

```

## 快速开始

### 1. 安装依赖

分别进入 `backend` 和 `frontend` 目录，执行：

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. 更新数据

填写好 `users.json` 后，执行以下命令更新数据：

```bash
cd backend
node crawler.js
```

### 3. 启动后端服务

```bash
cd backend
node index.js
```

默认监听地址为： [http://localhost:3000](http://localhost:3000)

### 4. 启动前端服务

```bash
cd frontend
npm run dev
```

默认监听地址为： [http://localhost:5173](http://localhost:5173)

### 5. 访问界面

在浏览器中打开：[http://localhost:5173](http://localhost:5173)

## 功能特性

* 题号输入框，自动选中文本便于复制粘贴
* 用户选择器，支持点击选择与反选
* 实时渲染查询结果，红/绿渐变提示题目是否可用
* 每位做过该题用户的卡片会展示头像、昵称、真实姓名(可选是否展示)

## 注意事项

* `backend/data/` 下应有每位用户的 `{uid}.json` 做题记录文件。
* `users.json` 文件用于映射用户基本信息，目前 **需手动维护**。
* 若需修改默认端口，请修改：

  * 后端端口：`backend/index.js`
  * 前端端口：`frontend/vite.config.js`

## TODO

* [ ] 自动化生成 `users.json`，支持根据页面源自动解析用户列表（爬取洛谷团队界面）
* [ ] 前端加入更新 `users.json` 的按钮，调用后端爬虫
* [ ] 前端加入 GUI 更新 `users.json` 的界面，并在后端适配更新 `users.json` 的接口

## License

GPLv3