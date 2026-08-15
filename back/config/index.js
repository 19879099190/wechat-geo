// config/index.js - 应用配置

const mysql = require('mysql2/promise');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'huanong-admin-secret-key-2024';

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'huanong_palm'
};

// 创建数据库连接池
function createPool() {
  return mysql.createPool(dbConfig);
}

// 初始化数据库表
async function initDatabase(pool) {
  try {
    // 创建 user_favorites 表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        poi_id INT NOT NULL COMMENT 'POI ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
        UNIQUE KEY unique_favorite (user_id, poi_id),
        INDEX idx_user_id (user_id),
        INDEX idx_poi_id (poi_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表'
    `);

    // 创建赏花点表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS flower_spots (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '赏花点名称',
        type VARCHAR(50) NOT NULL COMMENT '花卉类型',
        latitude DECIMAL(10, 7) NOT NULL COMMENT '纬度',
        longitude DECIMAL(10, 7) NOT NULL COMMENT '经度',
        description TEXT COMMENT '简介',
        detailed_description TEXT COMMENT '详细介绍',
        images TEXT COMMENT '图片列表(JSON)',
        video_url VARCHAR(255) COMMENT '视频URL',
        panorama_url VARCHAR(255) COMMENT '360全景URL',
        live_stream_url VARCHAR(255) COMMENT '直播流URL',
        best_time VARCHAR(50) COMMENT '最佳观赏时间',
        peak_time VARCHAR(50) COMMENT '盛花期',
        open_time VARCHAR(100) COMMENT '开放时间',
        features TEXT COMMENT '特色标签(JSON)',
        rating DECIMAL(3, 2) DEFAULT 0 COMMENT '评分',
        view_count INT DEFAULT 0 COMMENT '浏览量',
        favorite_count INT DEFAULT 0 COMMENT '收藏量',
        checkin_count INT DEFAULT 0 COMMENT '打卡量',
        status VARCHAR(20) DEFAULT 'upcoming' COMMENT '状态: blooming/upcoming/ended',
        bloom_progress INT DEFAULT 0 COMMENT '花期进度',
        tips TEXT COMMENT '游玩贴士(JSON)',
        facilities TEXT COMMENT '配套设施(JSON)',
        transportation TEXT COMMENT '交通指南(JSON)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='赏花点表'
    `);

    // 创建赏花路线表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS flower_routes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '路线名称',
        duration VARCHAR(50) COMMENT '游览时长',
        distance INT COMMENT '路线距离(米)',
        difficulty VARCHAR(20) COMMENT '难度等级',
        spots TEXT COMMENT '途经景点(JSON)',
        description TEXT COMMENT '路线描述',
        best_time VARCHAR(50) COMMENT '最佳时间',
        tags TEXT COMMENT '标签(JSON)',
        highlights TEXT COMMENT '路线亮点(JSON)',
        tips TEXT COMMENT '游玩贴士(JSON)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='赏花路线表'
    `);

    // 创建打卡记录表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS flower_checkins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        spot_id INT NOT NULL COMMENT '赏花点ID',
        images TEXT COMMENT '打卡图片(JSON)',
        comment TEXT COMMENT '打卡评论',
        rating INT DEFAULT 5 COMMENT '评分',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_spot_id (spot_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='赏花打卡表'
    `);

    console.log('✓ 数据库表初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
  }
}

module.exports = {
  PORT,
  WS_PORT,
  JWT_SECRET,
  dbConfig,
  createPool,
  initDatabase
};
