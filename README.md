# Luogu Query Tool

## 项目简介

**Luogu Query Tool** 是一个用于查询洛谷用户做题情况的全栈工具，支持通过题号快速查看指定用户是否做过该题，并提供美观直观的查询界面。

本项目包含：
- 前端：基于 **Vue 3 + Vite**，支持实时交互与动画效果。
- 后端：基于 **Node.js + Express**，用于提供题号查询接口与本地缓存。

## 目录结构

```

luogu-query-tool/
├── backend/                # Node.js 后端服务
│   ├── crawler.js          # 自动抓取做题数据脚本
│   ├── data/               # 存放各用户的做题记录（{uid}.json）
│   ├── index.js            # 后端主服务入口
│   ├── updUser.js          # 自动更新 users.json 脚本
│   ├── users.json          # 用户信息（自动生成）
│   └── www.luogu.com.cn_cookies.txt # 洛谷 cookies 文件
├── frontend/               # Vue3 + Vite 前端项目
│   ├── src/                # 前端源码
│   │   ├── App.vue         # 主组件
│   │   ├── index.css       # 样式
│   │   └── main.js         # 入口 JS
│   ├── index.html          # 前端入口 HTML
│   ├── package.json        # 前端依赖
│   ├── postcss.config.js   # PostCSS 配置
│   ├── tailwind.config.js  # Tailwind CSS 配置
│   └── vite.config.js      # Vite 配置
├── LICENSE
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

### 2. 更新用户信息

1. 准备 cookies 文件：
   - 使用 [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) 插件的 `Export As` 选项导出洛谷 cookies 保存为 `backend/www.luogu.com.cn_cookies.txt`（Netscape 格式）。
2. 运行自动更新脚本：
   - 默认团队 id 为 50877，可通过命令行参数指定其他团队。（除非你在团队里才可以获取到备注名）

```bash
cd backend
node updUser.js [团队id]
```

脚本会自动请求洛谷 API，携带 cookies，获取团队成员并更新 `users.json`。

### 3. 更新做题数据

确保 `backend/www.luogu.com.cn_cookies.txt` 文件存在，`crawler.js` 会自动读取并携带 cookies，无需手动填写请求头。

```bash
cd backend
node crawler.js
```

### 4. 启动后端服务

```bash
cd backend
node index.js
```

默认监听地址为： [http://localhost:3000](http://localhost:3000)

### 5. 启动前端服务

```bash
cd frontend
npm run dev
```

默认监听地址为： [http://localhost:5173](http://localhost:5173)

### 6. 访问界面

在浏览器中打开：[http://localhost:5173](http://localhost:5173)

## 功能特性

* 题号输入框，自动选中文本便于复制粘贴
* 用户选择器，支持点击选择与反选
* 实时渲染查询结果，红/绿渐变提示题目是否可用
* 每位做过该题用户的卡片会展示头像、昵称、真实姓名(可选是否展示)

## 注意事项

* `backend/data/` 下应有每位用户的 `{uid}.json` 做题记录文件。
* `users.json` 文件用于映射用户基本信息，可通过 `updUser.js` 自动生成。
* cookies 文件需放在 `backend` 目录，文件名为 `www.luogu.com.cn_cookies.txt`，crawler.js 和 updUser.js 均会自动读取并携带。
* 若需修改默认端口，请修改：

  * 后端端口：`backend/index.js`
  * 前端端口：`frontend/vite.config.js`

## TODO

* [x] 自动化生成 `users.json`，支持根据页面源自动解析用户列表（爬取洛谷团队界面）
* [ ] 前端加入更新 `users.json` 的按钮，调用后端爬虫
* [ ] 前端加入 GUI 更新 `users.json` 的界面，并在后端适配更新 `users.json` 的接口

## License

GPLv3