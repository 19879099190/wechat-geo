// routes/charging.js - 充电桩API

const express = require('express');
const router = express.Router();
const { broadcastChargingStatus } = require('../utils/websocket');

module.exports = (pool) => {
  /**
   * 获取充电桩列表
   * GET /api/charging/stations
   */
  router.get('/stations', async (req, res) => {
    try {
      const { latitude, longitude, status } = req.query;

      let sql = 'SELECT * FROM charging_station WHERE 1=1';
      const params = [];

      if (status !== undefined) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (latitude && longitude) {
        sql = `
          SELECT *,
          (6371000 * acos(cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) + sin(radians(?)) *
          sin(radians(latitude)))) AS distance
          FROM charging_station
          WHERE 1=1
        `;
        params.unshift(latitude, longitude, latitude);

        if (status !== undefined) {
          sql += ' AND status = ?';
        }

        sql += ' ORDER BY distance';
      }

      const [rows] = await pool.execute(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: rows
      });
    } catch (error) {
      console.error('获取充电桩列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 预约充电桩
   * POST /api/charging/reserve
   */
  router.post('/reserve', async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { stationId, startTime, duration, phone } = req.body;
      const userId = req.body.userId || req.headers.userid || 1; // 从请求体或header获取

      // 开启事务
      await connection.beginTransaction();

      // 锁定充电桩记录，防止并发预约
      const [station] = await connection.execute(
        'SELECT * FROM charging_station WHERE id = ? FOR UPDATE',
        [stationId]
      );

      if (station.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          code: -1,
          message: '充电桩不存在'
        });
      }

      if (station[0].status !== 0) {
        await connection.rollback();
        return res.status(400).json({
          code: -1,
          message: '充电桩当前不可用，状态：' + ['空闲', '充电中', '已预约', '故障'][station[0].status]
        });
      }

      // 创建预约记录
      const [result] = await connection.execute(
        'INSERT INTO charging_reservation (user_id, station_id, start_time, duration, phone, status, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())',
        [userId, stationId, startTime, duration || 60, phone]
      );

      // 更新充电桩状态为已预约
      await connection.execute(
        'UPDATE charging_station SET status = 2, updated_at = NOW() WHERE id = ?',
        [stationId]
      );

      // 提交事务
      await connection.commit();

      console.log(`✓ 预约成功: 用户${userId} 预约充电桩${stationId}, 预约ID: ${result.insertId}`);

      // 通过WebSocket通知状态更新
      broadcastChargingStatus(stationId, 2);

      res.json({
        code: 0,
        message: '预约成功',
        data: {
          reservationId: result.insertId,
          stationId: stationId,
          status: 2
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('预约失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误: ' + error.message
      });
    } finally {
      connection.release();
    }
  });

  /**
   * 获取充电桩详情
   * GET /api/charging/station/:id
   */
  router.get('/station/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const [stations] = await pool.execute(
        'SELECT * FROM charging_station WHERE id = ?',
        [id]
      );

      if (stations.length === 0) {
        return res.status(404).json({
          code: -1,
          message: '充电桩不存在'
        });
      }

      const station = stations[0];

      // 获取最近的充电记录
      const [records] = await pool.execute(
        `SELECT cr.*, u.nickname as user_name
         FROM charging_record cr
         LEFT JOIN users u ON cr.user_id = u.id
         WHERE cr.station_id = ?
         ORDER BY cr.start_time DESC
         LIMIT 10`,
        [id]
      );

      station.recentRecords = records;

      res.json({
        code: 0,
        message: 'success',
        data: station
      });
    } catch (error) {
      console.error('获取充电桩详情失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 取消预约
   * POST /api/charging/cancel/:id
   */
  router.post('/cancel/:id', async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { id } = req.params;

      // 开启事务
      await connection.beginTransaction();

      // 获取预约信息
      const [reservations] = await connection.execute(
        'SELECT * FROM charging_reservation WHERE id = ? FOR UPDATE',
        [id]
      );

      if (reservations.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          code: -1,
          message: '预约不存在'
        });
      }

      const reservation = reservations[0];

      // 更新预约状态为已取消
      await connection.execute(
        'UPDATE charging_reservation SET status = 3, updated_at = NOW() WHERE id = ?',
        [id]
      );

      // 更新充电桩状态为空闲
      await connection.execute(
        'UPDATE charging_station SET status = 0, updated_at = NOW() WHERE id = ?',
        [reservation.station_id]
      );

      // 提交事务
      await connection.commit();

      console.log(`✓ 取消预约成功: 预约ID ${id}, 充电桩${reservation.station_id}恢复空闲`);

      // 通过WebSocket通知状态更新
      broadcastChargingStatus(reservation.station_id, 0);

      res.json({
        code: 0,
        message: '取消预约成功',
        data: {
          stationId: reservation.station_id,
          status: 0
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('取消预约失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误: ' + error.message
      });
    } finally {
      connection.release();
    }
  });

  /**
   * 获取充电记录
   * GET /api/charging/records
   */
  router.get('/records', async (req, res) => {
    try {
      const { userId, status } = req.query;

      if (!userId) {
        return res.status(400).json({
          code: -1,
          message: '缺少用户ID'
        });
      }

      let sql = `
        SELECT cr.*, cs.name as station_name, cs.location
        FROM charging_record cr
        JOIN charging_station cs ON cr.station_id = cs.id
        WHERE cr.user_id = ?
      `;

      // 根据状态过滤
      if (status === 'ongoing') {
        sql += ' AND cr.end_time IS NULL';
      } else if (status === 'completed') {
        sql += ' AND cr.end_time IS NOT NULL';
      }

      sql += ' ORDER BY cr.start_time DESC';

      const [records] = await pool.execute(sql, [userId]);

      console.log(`查询充电记录: userId=${userId}, status=${status || 'all'}, 结果数量=${records.length}`);

      res.json({
        code: 0,
        message: 'success',
        data: records
      });
    } catch (error) {
      console.error('获取充电记录失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取用户在指定充电桩的预约
   * GET /api/charging/reservation
   */
  router.get('/reservation', async (req, res) => {
    try {
      const { userId, stationId } = req.query;

      if (!userId) {
        return res.status(400).json({
          code: -1,
          message: '缺少用户ID'
        });
      }

      let sql = `
        SELECT cr.*, cs.name as station_name, cs.location
        FROM charging_reservation cr
        JOIN charging_station cs ON cr.station_id = cs.id
        WHERE cr.user_id = ? AND cr.status = 1
      `;
      const params = [userId];

      if (stationId) {
        sql += ' AND cr.station_id = ?';
        params.push(stationId);
      }

      sql += ' ORDER BY cr.created_at DESC LIMIT 1';

      const [reservations] = await pool.execute(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: reservations.length > 0 ? reservations[0] : null
      });
    } catch (error) {
      console.error('获取预约信息失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取用户所有预约列表
   * GET /api/charging/reservations
   */
  router.get('/reservations', async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          code: -1,
          message: '缺少用户ID'
        });
      }

      const [reservations] = await pool.execute(
        `SELECT cr.*, cs.name as station_name, cs.location
         FROM charging_reservation cr
         JOIN charging_station cs ON cr.station_id = cs.id
         WHERE cr.user_id = ?
         ORDER BY cr.created_at DESC`,
        [userId]
      );

      res.json({
        code: 0,
        message: 'success',
        data: reservations
      });
    } catch (error) {
      console.error('获取预约列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 提交充电桩规划建议
   * POST /api/charging/suggestion
   */
  router.post('/suggestion', async (req, res) => {
    try {
      const { userId, location, locationName, latitude, longitude, reason } = req.body;
      const resolvedLocation = locationName || location;

      if (!userId || !resolvedLocation || !reason) {
        return res.status(400).json({
          code: -1,
          message: '用户、位置和建议原因不能为空'
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO charging_plan_suggestion
         (user_id, location_name, latitude, longitude, reason, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, resolvedLocation, latitude || null, longitude || null, reason]
      );

      res.json({
        code: 0,
        message: '建议提交成功，感谢您的反馈！',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('提交建议失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  router.get('/suggestions', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ code: -1, message: '缺少用户ID' });
      }
      const [rows] = await pool.execute(
        `SELECT id, location_name, latitude, longitude, reason, status, created_at
         FROM charging_plan_suggestion WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      res.json({ code: 0, message: 'success', data: rows });
    } catch (error) {
      console.error('获取充电点建议失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  /**
   * 开始充电
   * POST /api/charging/start
   */
  router.post('/start', async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { userId, stationId, reservationId } = req.body;

      console.log('=== 开始充电请求 ===');
      console.log('userId:', userId, 'stationId:', stationId, 'reservationId:', reservationId);

      if (!userId || !stationId) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      await connection.beginTransaction();

      // 检查充电桩状态
      const [stations] = await connection.execute(
        'SELECT * FROM charging_station WHERE id = ?',
        [stationId]
      );

      if (stations.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          code: -1,
          message: '充电桩不存在'
        });
      }

      const station = stations[0];

      if (station.status !== 0 && station.status !== 2) {
        await connection.rollback();
        return res.status(400).json({
          code: -1,
          message: '充电桩当前不可用'
        });
      }

      // 创建充电记录
      const [result] = await connection.execute(
        `INSERT INTO charging_record
         (user_id, station_id, start_time, created_at)
         VALUES (?, ?, NOW(), NOW())`,
        [userId, stationId]
      );

      const recordId = result.insertId;

      // 更新充电桩状态为充电中
      await connection.execute(
        'UPDATE charging_station SET status = 1, updated_at = NOW() WHERE id = ?',
        [stationId]
      );

      // 如果有预约，更新预约状态为已使用
      if (reservationId) {
        await connection.execute(
          'UPDATE charging_reservation SET status = 2, updated_at = NOW() WHERE id = ?',
          [reservationId]
        );
      }

      await connection.commit();

      console.log(`✓ 充电开始成功: 记录ID ${recordId}, 充电桩${stationId}状态更新为充电中`);

      // 通过WebSocket通知状态更新
      broadcastChargingStatus(stationId, 1);

      res.json({
        code: 0,
        message: '充电已开始',
        data: {
          recordId,
          stationId,
          startTime: new Date()
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('开始充电失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误: ' + error.message
      });
    } finally {
      connection.release();
    }
  });

  /**
   * 结束充电
   * POST /api/charging/stop
   */
  router.post('/stop', async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { userId, stationId, recordId } = req.body;

      console.log('=== 结束充电请求 ===');
      console.log('请求参数:', { userId, stationId, recordId });

      // 参数验证
      if (!userId || !stationId) {
        console.error('❌ 参数不完整:', { userId, stationId });
        return res.status(400).json({
          code: -1,
          message: '参数不完整：缺少用户ID或充电桩ID'
        });
      }

      await connection.beginTransaction();

      // 查找充电记录
      let record;
      let searchMethod = '';

      if (recordId) {
        searchMethod = '通过recordId查找';
        console.log(`查找充电记录: recordId=${recordId}, userId=${userId}`);
        const [records] = await connection.execute(
          'SELECT * FROM charging_record WHERE id = ? AND user_id = ? AND end_time IS NULL',
          [recordId, userId]
        );
        record = records[0];
        console.log('查询结果:', records.length > 0 ? '找到记录' : '未找到记录');
      } else {
        searchMethod = '通过userId和stationId查找';
        console.log(`查找充电记录: userId=${userId}, stationId=${stationId}`);
        const [records] = await connection.execute(
          'SELECT * FROM charging_record WHERE user_id = ? AND station_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
          [userId, stationId]
        );
        record = records[0];
        console.log('查询结果:', records.length > 0 ? `找到记录 ID=${records[0].id}` : '未找到记录');
      }

      if (!record) {
        await connection.rollback();
        console.error(`❌ 未找到充电记录 (${searchMethod})`);

        // 查询该用户的所有充电记录用于调试
        const [allRecords] = await connection.execute(
          'SELECT id, user_id, station_id, start_time, end_time FROM charging_record WHERE user_id = ? ORDER BY start_time DESC LIMIT 5',
          [userId]
        );
        console.log('该用户最近的充电记录:', allRecords);

        return res.status(404).json({
          code: -1,
          message: '未找到进行中的充电记录，请确认是否已开始充电'
        });
      }

      console.log('找到充电记录:', { id: record.id, start_time: record.start_time });

      // 获取充电桩信息
      const [stations] = await connection.execute(
        'SELECT * FROM charging_station WHERE id = ?',
        [stationId]
      );

      if (stations.length === 0) {
        await connection.rollback();
        console.error('❌ 充电桩不存在:', stationId);
        return res.status(404).json({
          code: -1,
          message: '充电桩不存在'
        });
      }

      const station = stations[0];
      console.log('充电桩信息:', { id: station.id, name: station.name, power: station.power, price: station.price });

      // 计算充电时长、电量和费用
      const startTime = new Date(record.start_time);
      const endTime = new Date();
      const durationMs = endTime - startTime;
      const durationMinutes = Math.max(1, Math.floor(durationMs / 60000)); // 至少1分钟
      const durationHours = durationMinutes / 60;

      // 格式化时长
      let durationText;
      if (durationMinutes < 60) {
        durationText = `${durationMinutes}分钟`;
      } else {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        durationText = `${hours}小时${minutes}分钟`;
      }

      // 计算充电量（kWh）= 功率(W) / 1000 * 时长(h)
      const energy = (station.power / 1000) * durationHours;

      // 计算费用 = 充电量 * 单价
      const price = station.price || 1.5;
      const cost = energy * price;

      console.log('计算结果:', {
        durationMinutes,
        durationText,
        energy: energy.toFixed(2),
        cost: cost.toFixed(2)
      });

      // 更新充电记录
      await connection.execute(
        `UPDATE charging_record
         SET end_time = NOW(), duration = ?, energy = ?, cost = ?, updated_at = NOW()
         WHERE id = ?`,
        [durationText, energy.toFixed(2), cost.toFixed(2), record.id]
      );
      console.log('✓ 充电记录已更新');

      // 更新充电桩状态为空闲
      await connection.execute(
        'UPDATE charging_station SET status = 0, updated_at = NOW() WHERE id = ?',
        [stationId]
      );
      console.log('✓ 充电桩状态已更新为空闲');

      await connection.commit();

      console.log(`✓ 充电结束成功: 记录ID ${record.id}, 时长${durationText}, 电量${energy.toFixed(2)}kWh, 费用¥${cost.toFixed(2)}`);

      // 通过WebSocket通知状态更新
      broadcastChargingStatus(stationId, 0);

      res.json({
        code: 0,
        message: '充电已结束',
        data: {
          recordId: record.id,
          stationId,
          duration: durationText,
          durationMinutes,
          energy: energy.toFixed(2),
          cost: cost.toFixed(2),
          startTime: record.start_time,
          endTime
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('❌ 结束充电失败:', error);
      console.error('错误堆栈:', error.stack);
      res.status(500).json({
        code: -1,
        message: '服务器错误: ' + error.message
      });
    } finally {
      connection.release();
    }
  });

  /**
   * 取消充电（中途取消）
   * POST /api/charging/cancel-charging
   */
  router.post('/cancel-charging', async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { userId, stationId, recordId } = req.body;

      console.log('=== 取消充电请求 ===');
      console.log('请求参数:', { userId, stationId, recordId });

      // 参数验证
      if (!userId || !stationId) {
        console.error('❌ 参数不完整:', { userId, stationId });
        return res.status(400).json({
          code: -1,
          message: '参数不完整：缺少用户ID或充电桩ID'
        });
      }

      await connection.beginTransaction();

      // 查找充电记录
      let record;
      if (recordId) {
        console.log(`查找充电记录: recordId=${recordId}, userId=${userId}`);
        const [records] = await connection.execute(
          'SELECT * FROM charging_record WHERE id = ? AND user_id = ? AND end_time IS NULL',
          [recordId, userId]
        );
        record = records[0];
      } else {
        console.log(`查找充电记录: userId=${userId}, stationId=${stationId}`);
        const [records] = await connection.execute(
          'SELECT * FROM charging_record WHERE user_id = ? AND station_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
          [userId, stationId]
        );
        record = records[0];
      }

      if (!record) {
        await connection.rollback();
        console.error('❌ 未找到充电记录');
        return res.status(404).json({
          code: -1,
          message: '未找到进行中的充电记录'
        });
      }

      console.log('找到充电记录:', { id: record.id, start_time: record.start_time });

      // 获取充电桩信息
      const [stations] = await connection.execute(
        'SELECT * FROM charging_station WHERE id = ?',
        [stationId]
      );

      if (stations.length === 0) {
        await connection.rollback();
        console.error('❌ 充电桩不存在:', stationId);
        return res.status(404).json({
          code: -1,
          message: '充电桩不存在'
        });
      }

      const station = stations[0];

      // 计算充电时长、电量和费用
      const startTime = new Date(record.start_time);
      const endTime = new Date();
      const durationMs = endTime - startTime;
      const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));
      const durationHours = durationMinutes / 60;

      // 格式化时长
      let durationText;
      if (durationMinutes < 60) {
        durationText = `${durationMinutes}分钟`;
      } else {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        durationText = `${hours}小时${minutes}分钟`;
      }

      // 计算充电量和费用（按实际时长计费）
      const energy = (station.power / 1000) * durationHours;
      const price = station.price || 1.5;
      const cost = energy * price;

      console.log('取消充电计算结果:', {
        durationMinutes,
        durationText,
        energy: energy.toFixed(2),
        cost: cost.toFixed(2)
      });

      // 更新充电记录，标记为已取消
      await connection.execute(
        `UPDATE charging_record
         SET end_time = NOW(), duration = ?, energy = ?, cost = ?,
             status = 'cancelled', updated_at = NOW()
         WHERE id = ?`,
        [durationText, energy.toFixed(2), cost.toFixed(2), record.id]
      );
      console.log('✓ 充电记录已更新（已取消）');

      // 更新充电桩状态为空闲
      await connection.execute(
        'UPDATE charging_station SET status = 0, updated_at = NOW() WHERE id = ?',
        [stationId]
      );
      console.log('✓ 充电桩状态已更新为空闲');

      await connection.commit();

      console.log(`✓ 充电已取消: 记录ID ${record.id}, 时长${durationText}, 费用¥${cost.toFixed(2)}`);

      // 通过WebSocket通知状态更新
      broadcastChargingStatus(stationId, 0);

      res.json({
        code: 0,
        message: '充电已取消',
        data: {
          recordId: record.id,
          stationId,
          duration: durationText,
          durationMinutes,
          energy: energy.toFixed(2),
          cost: cost.toFixed(2),
          startTime: record.start_time,
          endTime,
          status: 'cancelled'
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('❌ 取消充电失败:', error);
      console.error('错误堆栈:', error.stack);
      res.status(500).json({
        code: -1,
        message: '服务器错误: ' + error.message
      });
    } finally {
      connection.release();
    }
  });

  /**
   * 获取充电桩使用统计
   * GET /api/charging/stats
   */
  router.get('/stats', async (req, res) => {
    try {
      // 总充电桩数
      const [totalCount] = await pool.execute(
        'SELECT COUNT(*) as total FROM charging_station'
      );

      // 各状态统计
      const [statusStats] = await pool.execute(
        `SELECT status, COUNT(*) as count
         FROM charging_station
         GROUP BY status`
      );

      // 今日充电次数
      const [todayCount] = await pool.execute(
        `SELECT COUNT(*) as count
         FROM charging_record
         WHERE DATE(start_time) = CURDATE()`
      );

      // 最热门充电桩
      const [popularStations] = await pool.execute(
        `SELECT cs.id, cs.name, cs.location, COUNT(cr.id) as usage_count
         FROM charging_station cs
         LEFT JOIN charging_record cr ON cs.id = cr.station_id
         GROUP BY cs.id
         ORDER BY usage_count DESC
         LIMIT 5`
      );

      res.json({
        code: 0,
        message: 'success',
        data: {
          totalStations: totalCount[0].total,
          statusStats,
          todayCharging: todayCount[0].count,
          popularStations
        }
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  return router;
};
