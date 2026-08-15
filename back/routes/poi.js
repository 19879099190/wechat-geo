// routes/poi.js - POI相关API

const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 获取POI列表
   * GET /api/poi/list
   */
  router.get('/list', async (req, res) => {
    try {
      const { type, keyword, latitude, longitude, radius = 5000, page = 1, pageSize = 10 } = req.query;

      let sql = 'SELECT * FROM poi WHERE 1=1';
      const params = [];

      // 类型筛选
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      // 关键词搜索
      if (keyword) {
        sql += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      // 如果有位置信息,计算距离并排序
      if (latitude && longitude) {
        sql = `
          SELECT *,
          (6371000 * acos(cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) + sin(radians(?)) *
          sin(radians(latitude)))) AS distance
          FROM poi
          WHERE 1=1
        `;
        params.unshift(latitude, longitude, latitude);

        if (type) {
          sql += ' AND type = ?';
        }
        if (keyword) {
          sql += ' AND (name LIKE ? OR description LIKE ?)';
        }

        sql += ` HAVING distance <= ${radius}`;
        sql += ' ORDER BY distance';
      } else {
        sql += ' ORDER BY rating DESC, id DESC';
      }

      // 分页
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;
      sql += ' LIMIT ? OFFSET ?';
      params.push(pageSizeNum, offset);

      const [rows] = await pool.query(sql, params);

      // 获取总数
      let countSql = 'SELECT COUNT(*) as total FROM poi WHERE 1=1';
      const countParams = [];
      if (type) {
        countSql += ' AND type = ?';
        countParams.push(type);
      }
      const [countResult] = await pool.execute(countSql, countParams);
      const total = countResult[0].total;

      res.json({
        code: 0,
        message: 'success',
        data: {
          list: rows,
          total: total,
          hasMore: offset + rows.length < total
        }
      });
    } catch (error) {
      console.error('获取POI列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 搜索POI (增强版)
   * GET /api/poi/search
   */
  router.get('/search', async (req, res) => {
    try {
      const {
        keyword,
        type,
        minRating,
        latitude,
        longitude,
        radius,
        limit = 20
      } = req.query;

      // 如果没有关键词，返回空结果
      if (!keyword || keyword.trim() === '') {
        return res.json({
          code: 0,
          message: 'success',
          data: {
            list: [],
            total: 0
          }
        });
      }

      const searchTerm = `%${keyword.trim()}%`;
      const params = [];

      // 构建SQL查询
      let sql = `SELECT id, name, type, latitude, longitude, description, rating, open_time`;

      // 如果提供了位置信息，计算距离
      if (latitude && longitude) {
        sql += `, (6371000 * acos(cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) + sin(radians(?)) *
                sin(radians(latitude)))) AS distance`;
        params.push(latitude, longitude, latitude);
      }

      sql += ` FROM poi WHERE (name LIKE ? OR description LIKE ?)`;
      params.push(searchTerm, searchTerm);

      // 类型过滤
      if (type) {
        sql += ` AND type = ?`;
        params.push(type);
      }

      // 评分过滤
      if (minRating) {
        sql += ` AND rating >= ?`;
        params.push(parseFloat(minRating));
      }

      // 距离过滤
      if (latitude && longitude && radius) {
        sql += ` HAVING distance <= ?`;
        params.push(parseFloat(radius));
      }

      // 排序：优先匹配名称开头的，然后按评分和距离排序
      sql += ` ORDER BY
        CASE
          WHEN name LIKE ? THEN 1
          WHEN name LIKE ? THEN 2
          ELSE 3
        END`;
      params.push(`${keyword.trim()}%`, searchTerm);

      // 如果有位置信息，按距离排序
      if (latitude && longitude) {
        sql += `, distance ASC`;
      } else {
        sql += `, rating DESC`;
      }

      sql += ` LIMIT ?`;
      params.push(parseInt(limit));

      const [rows] = await pool.execute(sql, params);

      // 格式化距离显示
      if (latitude && longitude) {
        rows.forEach(row => {
          if (row.distance !== undefined) {
            row.distanceText = row.distance < 1000
              ? `${Math.round(row.distance)}米`
              : `${(row.distance / 1000).toFixed(1)}公里`;
          }
        });
      }

      res.json({
        code: 0,
        message: 'success',
        data: {
          list: rows,
          total: rows.length,
          keyword: keyword.trim()
        }
      });
    } catch (error) {
      console.error('搜索POI失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 热门搜索关键词
   * GET /api/poi/search/hot
   */
  router.get('/search/hot', async (req, res) => {
    try {
      // 返回热门POI作为搜索建议
      const [rows] = await pool.execute(
        `SELECT name, type, rating
         FROM poi
         WHERE rating >= 4.0
         ORDER BY rating DESC, hot DESC
         LIMIT 10`
      );

      res.json({
        code: 0,
        message: 'success',
        data: rows
      });
    } catch (error) {
      console.error('获取热门搜索失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 搜索建议 (自动补全)
   * GET /api/poi/search/suggest
   */
  router.get('/search/suggest', async (req, res) => {
    try {
      const { keyword } = req.query;

      if (!keyword || keyword.trim() === '') {
        return res.json({
          code: 0,
          message: 'success',
          data: []
        });
      }

      const searchTerm = `${keyword.trim()}%`;
      const [rows] = await pool.execute(
        `SELECT DISTINCT name, type
         FROM poi
         WHERE name LIKE ?
         ORDER BY rating DESC
         LIMIT 10`,
        [searchTerm]
      );

      res.json({
        code: 0,
        message: 'success',
        data: rows
      });
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取POI详情
   * GET /api/poi/detail/:id
   */
  router.get('/detail/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.query.userId; // 可选，用于判断是否已收藏

      const [rows] = await pool.execute(
        'SELECT * FROM poi WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          code: -1,
          message: 'POI不存在'
        });
      }

      const poi = rows[0];

      // 检查是否已收藏
      if (userId) {
        const [favorites] = await pool.execute(
          'SELECT id FROM user_favorites WHERE user_id = ? AND poi_id = ?',
          [userId, id]
        );
        poi.isFavorited = favorites.length > 0;
      } else {
        poi.isFavorited = false;
      }

      res.json({
        code: 0,
        message: 'success',
        data: poi
      });
    } catch (error) {
      console.error('获取POI详情失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  return router;
};
