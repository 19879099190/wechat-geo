// routes/gis.js - GIS分析API

const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 缓冲区分析
   * POST /api/gis/buffer-analysis
   */
  router.post('/buffer-analysis', async (req, res) => {
    try {
      const { latitude, longitude, radius, type } = req.body;

      if (!latitude || !longitude || !radius) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      // 查询范围内的POI
      let sql = `
        SELECT *,
        (6371000 * acos(cos(radians(?)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) + sin(radians(?)) *
        sin(radians(latitude)))) AS distance
        FROM poi
        WHERE 1=1
      `;
      const params = [latitude, longitude, latitude];

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      sql += ' HAVING distance <= ? ORDER BY distance';
      params.push(radius);

      const [results] = await pool.execute(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: {
          center: { latitude, longitude },
          radius,
          results: results.map(item => ({
            ...item,
            distanceText: item.distance < 1000
              ? `${Math.round(item.distance)}米`
              : `${(item.distance / 1000).toFixed(1)}公里`
          }))
        }
      });
    } catch (error) {
      console.error('缓冲区分析失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 周边快速搜索
   * GET /api/gis/nearby-search
   */
  router.get('/nearby-search', async (req, res) => {
    try {
      const { latitude, longitude, radius = 1000, types, keyword } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          code: -1,
          message: '缺少位置参数'
        });
      }

      let sql = `
        SELECT *,
        (6371000 * acos(cos(radians(?)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) + sin(radians(?)) *
        sin(radians(latitude)))) AS distance
        FROM poi
        WHERE 1=1
      `;
      const params = [latitude, longitude, latitude];

      if (types) {
        const typeList = types.split(',');
        sql += ` AND type IN (${typeList.map(() => '?').join(',')})`;
        params.push(...typeList);
      }

      if (keyword) {
        sql += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      sql += ' HAVING distance <= ? ORDER BY distance LIMIT 50';
      params.push(parseFloat(radius));

      const [results] = await pool.execute(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: results.map(item => ({
          ...item,
          distanceText: item.distance < 1000
            ? `${Math.round(item.distance)}米`
            : `${(item.distance / 1000).toFixed(1)}公里`
        }))
      });
    } catch (error) {
      console.error('周边搜索失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取热力图数据
   * GET /api/gis/heatmap
   */
  router.get('/heatmap', async (req, res) => {
    try {
      const { type = 'poi' } = req.query;

      let sql, params = [];

      if (type === 'flower') {
        sql = 'SELECT latitude, longitude, view_count as weight FROM flower_spots WHERE status = "blooming"';
      } else {
        sql = 'SELECT latitude, longitude, hot as weight FROM poi WHERE hot > 0';
      }

      const [results] = await pool.execute(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: results.map(item => ({
          lat: parseFloat(item.latitude),
          lng: parseFloat(item.longitude),
          count: item.weight || 1
        }))
      });
    } catch (error) {
      console.error('获取热力图数据失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 最近设施查询
   * GET /api/gis/nearest-facility
   */
  router.get('/nearest-facility', async (req, res) => {
    try {
      const { latitude, longitude, facilityType, limit = 5 } = req.query;

      if (!latitude || !longitude || !facilityType) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      const sql = `
        SELECT *,
        (6371000 * acos(cos(radians(?)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) + sin(radians(?)) *
        sin(radians(latitude)))) AS distance
        FROM poi
        WHERE type = ?
        ORDER BY distance
        LIMIT ?
      `;

      const [results] = await pool.execute(sql, [
        latitude, longitude, latitude, facilityType, parseInt(limit)
      ]);

      res.json({
        code: 0,
        message: 'success',
        data: results.map(item => ({
          ...item,
          distanceText: item.distance < 1000
            ? `${Math.round(item.distance)}米`
            : `${(item.distance / 1000).toFixed(1)}公里`
        }))
      });
    } catch (error) {
      console.error('最近设施查询失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  return router;
};
