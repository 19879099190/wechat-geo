// routes/favorites.js - 收藏相关API

const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 收藏POI
   * POST /api/favorites/add
   */
  router.post('/add', async (req, res) => {
    try {
      const { userId, poiId } = req.body;

      if (!userId || !poiId) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      // 检查POI是否存在
      const [poi] = await pool.execute(
        'SELECT id FROM poi WHERE id = ?',
        [poiId]
      );

      if (poi.length === 0) {
        return res.status(404).json({
          code: -1,
          message: 'POI不存在'
        });
      }

      // 检查是否已收藏
      const [existing] = await pool.execute(
        'SELECT id FROM user_favorites WHERE user_id = ? AND poi_id = ?',
        [userId, poiId]
      );

      if (existing.length > 0) {
        return res.json({
          code: 0,
          message: '已经收藏过了'
        });
      }

      // 添加收藏
      await pool.execute(
        'INSERT INTO user_favorites (user_id, poi_id) VALUES (?, ?)',
        [userId, poiId]
      );

      res.json({
        code: 0,
        message: '收藏成功'
      });
    } catch (error) {
      console.error('收藏失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 取消收藏
   * POST /api/favorites/remove
   */
  router.post('/remove', async (req, res) => {
    try {
      const { userId, poiId } = req.body;

      if (!userId || !poiId) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      const [result] = await pool.execute(
        'DELETE FROM user_favorites WHERE user_id = ? AND poi_id = ?',
        [userId, poiId]
      );

      if (result.affectedRows === 0) {
        return res.json({
          code: 0,
          message: '未收藏过此POI'
        });
      }

      res.json({
        code: 0,
        message: '取消收藏成功'
      });
    } catch (error) {
      console.error('取消收藏失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取用户收藏列表
   * GET /api/favorites/list
   */
  router.get('/list', async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          code: -1,
          message: '缺少用户ID'
        });
      }

      const [favorites] = await pool.execute(
        `SELECT
          p.*,
          f.created_at as favorited_at
        FROM user_favorites f
        INNER JOIN poi p ON f.poi_id = p.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC`,
        [userId]
      );

      res.json({
        code: 0,
        message: 'success',
        data: {
          list: favorites,
          total: favorites.length
        }
      });
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 检查是否已收藏
   * GET /api/favorites/check
   */
  router.get('/check', async (req, res) => {
    try {
      const { userId, poiId } = req.query;

      if (!userId || !poiId) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      const [favorites] = await pool.execute(
        'SELECT id FROM user_favorites WHERE user_id = ? AND poi_id = ?',
        [userId, poiId]
      );

      res.json({
        code: 0,
        message: 'success',
        data: {
          isFavorited: favorites.length > 0
        }
      });
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  return router;
};
