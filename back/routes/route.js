// routes/route.js - 路径规划API

const express = require('express');
const router = express.Router();
const { calculateDistance, generateRoutePoints } = require('../utils/helpers');

module.exports = (pool) => {
  /**
   * 路径规划
   * POST /api/route/plan
   */
  router.post('/plan', async (req, res) => {
    try {
      const { from, to, mode = 'walking', alternatives = true } = req.body;

      if (!from || !to || !from.latitude || !to.latitude) {
        return res.status(400).json({
          code: -1,
          message: '起点和终点信息不完整'
        });
      }

      // 计算直线距离
      const distance = calculateDistance(
        from.latitude, from.longitude,
        to.latitude, to.longitude
      );

      // 根据出行方式计算时间和速度
      let speed, timeMultiplier;
      switch (mode) {
        case 'walking':
          speed = 1.2; // 步行速度 1.2 m/s (约4.3 km/h)
          timeMultiplier = 1.3; // 考虑转弯等因素
          break;
        case 'bicycling':
          speed = 4; // 骑行速度 4 m/s (约14.4 km/h)
          timeMultiplier = 1.2;
          break;
        case 'bus':
          speed = 6; // 校巴平均速度 6 m/s (约21.6 km/h)
          timeMultiplier = 1.5; // 考虑等车和停靠时间
          break;
        default:
          speed = 1.2;
          timeMultiplier = 1.3;
      }

      // 生成主路线
      const mainRoute = {
        duration: Math.round((distance / speed) * timeMultiplier / 60), // 转换为分钟
        distance: distance,
        description: mode === 'walking' ? '推荐路线 - 最短路径' :
                     mode === 'bicycling' ? '推荐路线 - 平坦道路' :
                     '推荐路线 - 途经主要站点',
        polyline: generateRoutePoints(from, to, 0),
        steps: [
          { instruction: `从 ${from.name} 出发`, distance: 0 },
          { instruction: mode === 'walking' ? '直行' : mode === 'bicycling' ? '沿主干道骑行' : '乘坐校巴', distance: Math.round(distance * 0.5) },
          { instruction: `到达 ${to.name}`, distance: distance }
        ]
      };

      const routes = [mainRoute];

      // 生成备选路线
      if (alternatives && distance > 500) {
        // 备选路线1 - 稍微绕路但风景好
        const altRoute1 = {
          duration: Math.round(mainRoute.duration * 1.15),
          distance: Math.round(distance * 1.1),
          description: mode === 'walking' ? '备选路线 - 风景优美' :
                       mode === 'bicycling' ? '备选路线 - 更安全' :
                       '备选路线 - 站点更多',
          polyline: generateRoutePoints(from, to, 1),
          steps: [
            { instruction: `从 ${from.name} 出发`, distance: 0 },
            { instruction: '向右转', distance: Math.round(distance * 0.3) },
            { instruction: '继续前行', distance: Math.round(distance * 0.6) },
            { instruction: `到达 ${to.name}`, distance: Math.round(distance * 1.1) }
          ]
        };
        routes.push(altRoute1);

        // 备选路线2 - 更绕但有特色
        if (distance > 1000) {
          const altRoute2 = {
            duration: Math.round(mainRoute.duration * 1.25),
            distance: Math.round(distance * 1.2),
            description: mode === 'walking' ? '备选路线 - 树荫较多' :
                         mode === 'bicycling' ? '备选路线 - 坡度较小' :
                         '备选路线 - 快速直达',
            polyline: generateRoutePoints(from, to, -1),
            steps: [
              { instruction: `从 ${from.name} 出发`, distance: 0 },
              { instruction: '向左转', distance: Math.round(distance * 0.3) },
              { instruction: '继续前行', distance: Math.round(distance * 0.7) },
              { instruction: `到达 ${to.name}`, distance: Math.round(distance * 1.2) }
            ]
          };
          routes.push(altRoute2);
        }
      }

      res.json({
        code: 0,
        message: 'success',
        data: { routes }
      });
    } catch (error) {
      console.error('路径规划失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 校巴路线规划
   * POST /api/route/bus
   */
  router.post('/bus', async (req, res) => {
    try {
      const { from, to } = req.body;

      // 查询可用的校巴线路
      const [lines] = await pool.execute('SELECT * FROM bus_line');

      // 简化版：返回所有线路作为可选方案
      const routes = lines.map(line => ({
        lineId: line.id,
        lineName: line.name,
        lineNumber: line.number,
        duration: 20, // 预估时间
        distance: 3000, // 预估距离
        description: `${line.name} - ${line.operating_time}`,
        waitTime: line.interval_minutes,
        polyline: generateRoutePoints(from, to, 0)
      }));

      res.json({
        code: 0,
        message: 'success',
        data: { routes }
      });
    } catch (error) {
      console.error('校巴路线规划失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 保存常用路线
   * POST /api/route/save
   */
  router.post('/save', async (req, res) => {
    try {
      const {
        userId, name, from, to, mode = 'walking', duration = null, distance = null
      } = req.body;

      if (!userId || !from || !to || !from.name || !to.name ||
          from.latitude === undefined || from.longitude === undefined ||
          to.latitude === undefined || to.longitude === undefined) {
        return res.status(400).json({ code: -1, message: '用户、起点和终点信息不能为空' });
      }

      const [result] = await pool.execute(
        `INSERT INTO frequent_route
         (user_id, name, from_name, from_latitude, from_longitude,
          to_name, to_latitude, to_longitude, mode, duration, distance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          name || `${from.name} → ${to.name}`,
          from.name,
          from.latitude,
          from.longitude,
          to.name,
          to.latitude,
          to.longitude,
          mode,
          duration,
          distance === null || distance === undefined ? null : String(distance)
        ]
      );

      res.json({ code: 0, message: '常用路线保存成功', data: { id: result.insertId } });
    } catch (error) {
      console.error('保存常用路线失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  /**
   * 获取用户的常用路线
   * GET /api/route/my-routes?userId=1
   */
  router.get('/my-routes', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ code: -1, message: '缺少用户ID' });
      }

      const [rows] = await pool.execute(
        'SELECT * FROM frequent_route WHERE user_id = ? ORDER BY created_at DESC, id DESC',
        [userId]
      );
      res.json({ code: 0, message: 'success', data: rows });
    } catch (error) {
      console.error('获取常用路线失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  /**
   * 删除常用路线
   * DELETE /api/route/delete
   */
  router.delete('/delete', async (req, res) => {
    try {
      const { routeId, userId } = req.body;
      if (!routeId || !userId) {
        return res.status(400).json({ code: -1, message: '缺少路线或用户ID' });
      }

      const [result] = await pool.execute(
        'DELETE FROM frequent_route WHERE id = ? AND user_id = ?',
        [routeId, userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ code: -1, message: '常用路线不存在' });
      }
      res.json({ code: 0, message: '常用路线已删除' });
    } catch (error) {
      console.error('删除常用路线失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  return router;
};
