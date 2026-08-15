// routes/flower.js - 赏花功能API

const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { enrichRouteSpots } = require('../utils/helpers');

module.exports = (pool) => {
  /**
   * 获取赏花点列表
   * GET /api/flower/spots
   */
  router.get('/spots', async (req, res) => {
    try {
      const { category, latitude, longitude, radius, status } = req.query;

      let sql = 'SELECT * FROM flower_spots WHERE 1=1';
      const params = [];

      if (category && category !== '全部') {
        sql += ' AND type = ?';
        params.push(category);
      }

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (latitude && longitude && radius) {
        sql = `
          SELECT *,
          (6371000 * acos(cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) + sin(radians(?)) *
          sin(radians(latitude)))) AS distance
          FROM flower_spots
          WHERE 1=1
        `;
        params.unshift(latitude, longitude, latitude);

        if (category && category !== '全部') {
          sql += ' AND type = ?';
        }
        if (status) {
          sql += ' AND status = ?';
        }

        sql += ' HAVING distance <= ? ORDER BY distance';
        params.push(parseFloat(radius));
      } else {
        sql += ' ORDER BY view_count DESC';
      }

      const [spots] = await pool.execute(sql, params);

      // 解析JSON字段
      const formattedSpots = spots.map(spot => ({
        ...spot,
        images: spot.images ? JSON.parse(spot.images) : [],
        features: spot.features ? JSON.parse(spot.features) : [],
        tips: spot.tips ? JSON.parse(spot.tips) : [],
        facilities: spot.facilities ? JSON.parse(spot.facilities) : [],
        transportation: spot.transportation ? JSON.parse(spot.transportation) : [],
        hasVideo: !!spot.video_url,
        has360: !!spot.panorama_url,
        hasLiveStream: !!spot.live_stream_url
      }));

      res.json({
        code: 0,
        message: 'success',
        data: formattedSpots
      });
    } catch (error) {
      console.error('获取赏花点列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取赏花点详情
   * GET /api/flower/spot/:id
   */
  router.get('/spot/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const [spots] = await pool.execute(
        'SELECT * FROM flower_spots WHERE id = ?',
        [id]
      );

      if (spots.length === 0) {
        return res.status(404).json({
          code: -1,
          message: '赏花点不存在'
        });
      }

      const spot = spots[0];

      // 增加浏览量
      await pool.execute(
        'UPDATE flower_spots SET view_count = view_count + 1 WHERE id = ?',
        [id]
      );

      // 解析JSON字段
      const formattedSpot = {
        ...spot,
        images: spot.images ? JSON.parse(spot.images) : [],
        features: spot.features ? JSON.parse(spot.features) : [],
        tips: spot.tips ? JSON.parse(spot.tips) : [],
        facilities: spot.facilities ? JSON.parse(spot.facilities) : [],
        transportation: spot.transportation ? JSON.parse(spot.transportation) : [],
        hasVideo: !!spot.video_url,
        has360: !!spot.panorama_url,
        hasLiveStream: !!spot.live_stream_url
      };

      res.json({
        code: 0,
        message: 'success',
        data: formattedSpot
      });
    } catch (error) {
      console.error('获取赏花点详情失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取赏花路线列表（关联赏花点详情）
   * GET /api/flower/routes
   */
  router.get('/routes', async (req, res) => {
    try {
      const [routes] = await pool.query('SELECT * FROM flower_routes ORDER BY id');
      const enriched = await enrichRouteSpots(routes, pool);
      res.json({ code: 0, message: 'success', data: enriched });
    } catch (error) {
      console.error('获取赏花路线失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  /**
   * 提交赏花打卡
   * POST /api/flower/checkin
   */
  router.post('/checkin', async (req, res) => {
    try {
      const { userId, spotId, images, comment, rating = 5 } = req.body;

      if (!userId || !spotId || !images || images.length === 0) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      await pool.execute(
        'INSERT INTO flower_checkins (user_id, spot_id, images, comment, rating) VALUES (?, ?, ?, ?, ?)',
        [userId, spotId, JSON.stringify(images), comment, rating]
      );

      // 更新赏花点打卡数
      await pool.execute(
        'UPDATE flower_spots SET checkin_count = checkin_count + 1 WHERE id = ?',
        [spotId]
      );

      res.json({
        code: 0,
        message: '打卡成功'
      });
    } catch (error) {
      console.error('打卡失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 上传打卡图片
   * POST /api/flower/upload-checkin
   */
  router.post('/upload-checkin', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ code: -1, message: '请选择图片' });
      }

      const imageUrl = `/images/flower/${req.file.filename}`;
      res.json({
        code: 0,
        message: '上传成功',
        data: {
          url: imageUrl,
          filename: req.file.filename
        }
      });
    } catch (error) {
      console.error('上传打卡图片失败:', error);
      res.status(500).json({ code: -1, message: error.message || '上传失败' });
    }
  });

  /**
   * 获取用户打卡状态
   * GET /api/flower/user-checkin-status
   */
  router.get('/user-checkin-status', async (req, res) => {
    try {
      const { userId, spotId } = req.query;

      if (!userId || !spotId) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      const [checkins] = await pool.execute(
        'SELECT * FROM flower_checkins WHERE user_id = ? AND spot_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId, spotId]
      );

      res.json({
        code: 0,
        message: 'success',
        data: checkins.length > 0 ? {
          hasCheckedIn: true,
          checkin: {
            ...checkins[0],
            images: JSON.parse(checkins[0].images || '[]')
          }
        } : {
          hasCheckedIn: false
        }
      });
    } catch (error) {
      console.error('获取打卡状态失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取打卡记录
   * GET /api/flower/checkins/:spotId
   */
  router.get('/checkins/:spotId', async (req, res) => {
    try {
      const { spotId } = req.params;

      const [checkins] = await pool.execute(
        `SELECT fc.*, u.nickname as userName, u.avatar
         FROM flower_checkins fc
         LEFT JOIN users u ON fc.user_id = u.id
         WHERE fc.spot_id = ?
         ORDER BY fc.created_at DESC
         LIMIT 20`,
        [spotId]
      );

      const formattedCheckins = checkins.map(checkin => ({
        ...checkin,
        images: checkin.images ? JSON.parse(checkin.images) : []
      }));

      res.json({
        code: 0,
        message: 'success',
        data: formattedCheckins
      });
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取路线详情（关联赏花点详情）
   * GET /api/flower/routes/:id
   */
  router.get('/routes/:id', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM flower_routes WHERE id=?', [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ code: -1, message: '路线不存在' });
      }

      const enriched = await enrichRouteSpots(rows, pool);
      res.json({ code: 0, data: enriched[0] });
    } catch (error) {
      console.error('获取路线详情失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  return router;
};
