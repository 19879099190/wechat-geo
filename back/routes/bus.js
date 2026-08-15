// routes/bus.js - 校巴API

const express = require('express');
const router = express.Router();
const { decodePolyline } = require('../utils/helpers');
const { requestTencentMap } = require('../utils/tencent-map');

module.exports = (pool) => {
  /**
   * 获取校巴线路列表
   * GET /api/bus/lines
   */
  router.get('/lines', async (req, res) => {
    try {
      const [lines] = await pool.execute('SELECT * FROM bus_line');

      // 为每条线路获取站点
      for (let line of lines) {
        const [stops] = await pool.execute(
          `SELECT bs.* FROM bus_stop bs
           JOIN bus_line_stop bls ON bs.id = bls.stop_id
           WHERE bls.line_id = ?
           ORDER BY bls.sequence`,
          [line.id]
        );
        line.stations = stops;
      }

      res.json({
        code: 0,
        message: 'success',
        data: lines
      });
    } catch (error) {
      console.error('获取校巴线路失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取线路详情
   * GET /api/bus/line/:id
   */
  router.get('/line/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const [lines] = await pool.execute('SELECT * FROM bus_line WHERE id = ?', [id]);

      if (lines.length === 0) {
        return res.status(404).json({
          code: -1,
          message: '线路不存在'
        });
      }

      const line = lines[0];

      // 获取站点
      const [stops] = await pool.execute(
        `SELECT bs.*, bls.sequence
         FROM bus_stop bs
         JOIN bus_line_stop bls ON bs.id = bls.stop_id
         WHERE bls.line_id = ?
         ORDER BY bls.sequence`,
        [id]
      );

      line.stations = stops;

      res.json({
        code: 0,
        message: 'success',
        data: line
      });
    } catch (error) {
      console.error('获取线路详情失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取校巴路线的真实道路路径
   * GET /api/bus/line/:id/route
   */
  router.get('/line/:id/route', async (req, res) => {
    try {
      const { id } = req.params;

      // 1. 先查询缓存
      const [lines] = await pool.execute(
        'SELECT route_cache FROM bus_line WHERE id = ?',
        [id]
      );

      if (lines.length === 0) {
        return res.json({
          code: -1,
          message: '线路不存在'
        });
      }

      // 如果有缓存，直接返回
      if (lines[0].route_cache) {
        try {
          const cachedData = JSON.parse(lines[0].route_cache);
          return res.json({
            code: 0,
            message: 'success (cached)',
            data: cachedData
          });
        } catch (e) {
          console.error('解析缓存失败:', e);
          // 缓存损坏，继续调用 API
        }
      }

      // 获取线路站点
      const [stops] = await pool.execute(
        `SELECT bs.*, bls.sequence
         FROM bus_stop bs
         JOIN bus_line_stop bls ON bs.id = bls.stop_id
         WHERE bls.line_id = ?
         ORDER BY bls.sequence`,
        [id]
      );

      if (stops.length < 2) {
        return res.json({
          code: -1,
          message: '站点数量不足，无法规划路线'
        });
      }

      // 分段调用腾讯地图驾车路线规划 API
      const allPoints = [];

      for (let i = 0; i < stops.length - 1; i++) {
        const from = `${stops[i].latitude},${stops[i].longitude}`;
        const to = `${stops[i + 1].latitude},${stops[i + 1].longitude}`;

        const routeData = await requestTencentMap('/ws/direction/v1/driving/', { from, to });

        if (routeData.status === 0 && routeData.result.routes.length > 0) {
          const route = routeData.result.routes[0];
          const polyline = route.polyline;

          // 腾讯地图驾车API的polyline格式：
          // 第一对是绝对坐标(已是度数)，后续每对是1e-6度单位的增量
          let points;
          if (Array.isArray(polyline) && polyline.length >= 2) {
            points = [];
            points.push({ latitude: polyline[0], longitude: polyline[1] });
            let curLat = Math.round(polyline[0] * 1e6);
            let curLng = Math.round(polyline[1] * 1e6);
            for (let j = 2; j < polyline.length - 1; j += 2) {
              curLat += polyline[j];
              curLng += polyline[j + 1];
              points.push({ latitude: curLat / 1e6, longitude: curLng / 1e6 });
            }
          } else {
            points = decodePolyline(polyline);
          }
          allPoints.push(...points);
        } else {
          // 如果 API 调用失败，使用直线连接
          allPoints.push({
            latitude: parseFloat(stops[i].latitude),
            longitude: parseFloat(stops[i].longitude)
          });
        }
      }

      // 添加最后一个站点
      allPoints.push({
        latitude: parseFloat(stops[stops.length - 1].latitude),
        longitude: parseFloat(stops[stops.length - 1].longitude)
      });

      const resultData = {
        points: allPoints,
        stations: stops
      };

      // 3. 保存到缓存
      await pool.execute(
        'UPDATE bus_line SET route_cache = ? WHERE id = ?',
        [JSON.stringify(resultData), id]
      );

      res.json({
        code: 0,
        message: 'success',
        data: resultData
      });
    } catch (error) {
      console.error('获取路线失败:', error);
      res.status(error.code === 'MAP_KEY_MISSING' ? 503 : 500).json({
        code: -1,
        message: error.code === 'MAP_KEY_MISSING' ? error.message : '服务器错误'
      });
    }
  });

  /**
   * 获取实时车辆位置
   * GET /api/bus/realtime/:lineId
   */
  router.get('/realtime/:lineId', async (req, res) => {
    try {
      const { lineId } = req.params;

      // 从Redis或实时数据库获取车辆位置
      // 这里返回模拟数据
      const buses = [
        {
          id: 1,
          busNumber: '001',
          latitude: 23.158,
          longitude: 113.352,
          speed: 25,
          currentLocation: '接近东区食堂站',
          nextStation: '东区食堂',
          distance: '200m',
          estimatedArrival: 3 // 预计3分钟到达
        }
      ];

      res.json({
        code: 0,
        message: 'success',
        data: buses
      });
    } catch (error) {
      console.error('获取实时位置失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取到站时间预测
   * GET /api/bus/arrival
   */
  router.get('/arrival', async (req, res) => {
    try {
      const { lineId, stopId } = req.query;

      if (!lineId || !stopId) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      // 模拟到站时间预测
      const arrivals = [
        {
          busNumber: '001',
          estimatedTime: 5,
          status: 'approaching'
        },
        {
          busNumber: '002',
          estimatedTime: 15,
          status: 'onroute'
        }
      ];

      res.json({
        code: 0,
        message: 'success',
        data: arrivals
      });
    } catch (error) {
      console.error('获取到站时间失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 订阅到站提醒
   * POST /api/bus/subscribe
   */
  router.post('/subscribe', async (req, res) => {
    try {
      const { lineId, stopId, userId } = req.body;

      if (!lineId || !stopId || !userId) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      // 检查是否已订阅
      const [existing] = await pool.execute(
        'SELECT id FROM bus_arrival_subscription WHERE user_id = ? AND line_id = ? AND stop_id = ?',
        [userId, lineId, stopId]
      );

      if (existing.length > 0) {
        return res.json({
          code: 0,
          message: '已订阅该站点'
        });
      }

      // 创建订阅
      await pool.execute(
        'INSERT INTO bus_arrival_subscription (user_id, line_id, stop_id, created_at) VALUES (?, ?, ?, NOW())',
        [userId, lineId, stopId]
      );

      res.json({
        code: 0,
        message: '订阅成功'
      });
    } catch (error) {
      console.error('订阅失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 取消订阅
   * DELETE /api/bus/subscribe/:id
   */
  router.delete('/subscribe/:id', async (req, res) => {
    try {
      const { id } = req.params;

      await pool.execute('DELETE FROM bus_arrival_subscription WHERE id = ?', [id]);

      res.json({
        code: 0,
        message: '取消订阅成功'
      });
    } catch (error) {
      console.error('取消订阅失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  return router;
};
