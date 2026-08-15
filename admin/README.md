# 管理后台前端

## 启动

先确保后端运行在 `http://localhost:4000`，然后执行（无需安装依赖）：

```bash
npm start
```

访问 `http://localhost:8080/admin-login.html`。

管理端通过 `http://localhost:4000/api` 调用后端接口。

## 文件结构

- `admin-login.html`、`admin-login.css`、`admin-login.js`：登录页
- `admin-dashboard.html`、`admin-dashboard.css`、`admin-dashboard.js`：管理主页
- `config.js`：共享 API 地址配置
