// server.js - 应用入口

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const config = require('./config');
const { upload } = require('./utils/upload');
const { initWebSocket, broadcastChargingStatus } = require('./utils/websocket');

// Route modules
const adminRoutes = require('./routes/admin');
const gisRoutes = require('./routes/gis');
const authRoutes = require('./routes/auth');
const poiRoutes = require('./routes/poi');
const favoritesRoutes = require('./routes/favorites');
const flowerRoutes = require('./routes/flower');
const routeRoutes = require('./routes/route');
const chargingRoutes = require('./routes/charging');
const busRoutes = require('./routes/bus');
const newsRoutes = require('./routes/news');
const parkingRoutes = require('./routes/parking');
const adminManageRoutes = require('./routes/admin-manage');
const mapRoutes = require('./routes/map');

// Scheduled tasks
const { startScheduledTasks } = require('./tasks/scheduled');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Database
const pool = config.createPool();

// Init database
config.initDatabase(pool);

// WebSocket
initWebSocket(config.WS_PORT);

// Register routes
app.use('/api/admin', adminRoutes(pool));
app.use('/api/admin', adminManageRoutes(pool, upload));
app.use('/api/gis', gisRoutes(pool));
app.use('/api/auth', authRoutes(pool));
app.use('/api/poi', poiRoutes(pool));
app.use('/api/favorites', favoritesRoutes(pool));
app.use('/api/flower', flowerRoutes(pool));
app.use('/api/route', routeRoutes(pool));
app.use('/api/charging', chargingRoutes(pool));
app.use('/api/bus', busRoutes(pool));
app.use('/api/news', newsRoutes(pool));
app.use('/api/parking', parkingRoutes(pool));
app.use('/api/map', mapRoutes());

// Start server
app.listen(config.PORT, () => {
  console.log('========================================');
console.log(`后端服务已启动:http://localhost:${config.PORT}`);
console.log(`API 测试地址:http://localhost:${config.PORT}/api/poi/list`);
console.log(`停车场接口:http://localhost:${config.PORT}/api/parking/list`);
console.log('管理后台前端:请在 ../admin 目录单独启动');
console.log(`WebSocket 地址:ws://localhost:${config.WS_PORT}`);
console.log(
  `数据库：${config.dbConfig.database}@${config.dbConfig.host}:${config.dbConfig.port}`
);
console.log('========================================');
  // 启动定时任务
  startScheduledTasks(pool, broadcastChargingStatus);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});
process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
});
