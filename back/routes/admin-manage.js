// routes/admin-manage.js - 管理后台CRUD API（与 routes/admin.js 共同注册在 /api/admin 下）

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = (pool, upload) => {
  // ==================== 用户管理 ====================

  /**
   * 获取所有用户
   * GET /api/admin/users
   */
  router.get('/users', async (req, res) => {
    try {
      const [users] = await pool.execute(
        `SELECT
          u.id,
          u.phone,
          u.nickname,
          u.avatar,
          u.created_at,
          u.last_login_at,
          COUNT(DISTINCT f.id) as favorite_count
        FROM users u
        LEFT JOIN user_favorites f ON u.id = f.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC`
      );

      res.json({
        code: 0,
        message: 'success',
        data: users
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取用户收藏统计
   * GET /api/admin/favorites/stats
   */
  router.get('/favorites/stats', async (req, res) => {
    try {
      // 总收藏数
      const [totalCount] = await pool.execute(
        'SELECT COUNT(*) as total FROM user_favorites'
      );

      // 最受欢迎的POI
      const [popularPoi] = await pool.execute(
        `SELECT
          p.id,
          p.name,
          p.type,
          COUNT(f.id) as favorite_count
        FROM poi p
        INNER JOIN user_favorites f ON p.id = f.poi_id
        GROUP BY p.id
        ORDER BY favorite_count DESC
        LIMIT 10`
      );

      // 收藏最多的用户
      const [activeUsers] = await pool.execute(
        `SELECT
          u.id,
          u.nickname,
          u.phone,
          COUNT(f.id) as favorite_count
        FROM users u
        INNER JOIN user_favorites f ON u.id = f.user_id
        GROUP BY u.id
        ORDER BY favorite_count DESC
        LIMIT 10`
      );

      res.json({
        code: 0,
        message: 'success',
        data: {
          totalCount: totalCount[0].total,
          popularPoi,
          activeUsers
        }
      });
    } catch (error) {
      console.error('获取收藏统计失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 删除用户
   * DELETE /api/admin/users/delete/:id
   */
  router.delete('/users/delete/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM users WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      console.error('删除用户失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== POI管理 ====================

  router.post('/poi/add', async (req, res) => {
    try {
      const { name, type, latitude, longitude, description, comment, rating, open_time, hot } = req.body;
      const [result] = await pool.execute(
        'INSERT INTO poi (name, type, latitude, longitude, description, comment, rating, open_time, hot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, type, latitude, longitude, description, comment, rating || 0, open_time, hot || 0]
      );
      res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
    } catch (error) {
      console.error('添加POI失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  router.put('/poi/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, latitude, longitude, description, comment, rating, open_time } = req.body;
      await pool.execute(
        'UPDATE poi SET name=?, type=?, latitude=?, longitude=?, description=?, comment=?, rating=?, open_time=? WHERE id=?',
        [name, type, latitude, longitude, description, comment, rating || 0, open_time, id]
      );
      res.json({ code: 0, message: '修改成功' });
    } catch (error) {
      console.error('修改POI失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  router.delete('/poi/delete/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM poi WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== 充电桩管理 ====================

  router.post('/charging/add', async (req, res) => {
    try {
      const { name, location, latitude, longitude, status, power, total_slots, available_slots, price } = req.body;
      const [result] = await pool.execute(
        'INSERT INTO charging_station (name, location, latitude, longitude, status, power, total_slots, available_slots, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, location, latitude, longitude, status || 0, power, total_slots, available_slots, price]
      );
      res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  router.put('/charging/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, location, latitude, longitude, status, power, total_slots, available_slots, price } = req.body;
      await pool.execute(
        'UPDATE charging_station SET name=?, location=?, latitude=?, longitude=?, status=?, power=?, total_slots=?, available_slots=?, price=? WHERE id=?',
        [name, location, latitude, longitude, status, power, total_slots, available_slots, price, id]
      );
      res.json({ code: 0, message: '修改成功' });
    } catch (error) {
      console.error('修改充电桩失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  router.delete('/charging/delete/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM charging_station WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== 校巴线路管理 ====================

  router.post('/bus/add', async (req, res) => {
    try {
      const { number, name, start_station, end_station, operating_time, interval_minutes } = req.body;
      const [result] = await pool.execute(
        'INSERT INTO bus_line (number, name, start_station, end_station, operating_time, interval_minutes) VALUES (?, ?, ?, ?, ?, ?)',
        [number, name, start_station, end_station, operating_time, interval_minutes]
      );
      res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
    } catch (error) {
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  router.put('/bus/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { number, name, start_station, end_station, operating_time, interval_minutes } = req.body;
      await pool.execute(
        'UPDATE bus_line SET number=?, name=?, start_station=?, end_station=?, operating_time=?, interval_minutes=? WHERE id=?',
        [number, name, start_station, end_station, operating_time, interval_minutes, id]
      );
      res.json({ code: 0, message: '修改成功' });
    } catch (error) {
      console.error('修改校巴失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  router.delete('/bus/delete/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM bus_line_stop WHERE line_id=?', [req.params.id]);
      await pool.execute('DELETE FROM bus_line WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== 校巴站点管理 API ====================

  // 获取所有站点
  router.get('/bus/stops', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM bus_stop ORDER BY id');
      res.json({ code: 0, data: rows });
    } catch (error) {
      console.error('获取站点列表失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 添加站点
  router.post('/bus/stops/add', async (req, res) => {
    try {
      const { name, latitude, longitude } = req.body;
      if (!name || !latitude || !longitude) {
        return res.status(400).json({ code: -1, message: '站点名称和坐标不能为空' });
      }
      const [result] = await pool.query(
        'INSERT INTO bus_stop (name, latitude, longitude) VALUES (?, ?, ?)',
        [name, latitude, longitude]
      );
      res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
    } catch (error) {
      console.error('添加站点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 更新站点
  router.put('/bus/stops/update/:id', async (req, res) => {
    try {
      const { name, latitude, longitude } = req.body;
      await pool.query(
        'UPDATE bus_stop SET name=?, latitude=?, longitude=? WHERE id=?',
        [name, latitude, longitude, req.params.id]
      );
      res.json({ code: 0, message: '修改成功' });
    } catch (error) {
      console.error('修改站点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 删除站点
  router.delete('/bus/stops/delete/:id', async (req, res) => {
    try {
      const [refs] = await pool.query('SELECT COUNT(*) as cnt FROM bus_line_stop WHERE stop_id=?', [req.params.id]);
      if (refs[0].cnt > 0) {
        return res.status(400).json({ code: -1, message: '该站点已被线路使用，请先解除关联' });
      }
      await pool.query('DELETE FROM bus_stop WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      console.error('删除站点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 保存线路站点关联（全量替换）
  router.post('/bus/line/:id/stops', async (req, res) => {
    try {
      const lineId = req.params.id;
      const { stops } = req.body; // [{stop_id, sequence}]

      // 先删除旧关联
      await pool.query('DELETE FROM bus_line_stop WHERE line_id=?', [lineId]);

      // 批量插入新关联
      if (stops && stops.length > 0) {
        const values = stops.map(s => [lineId, s.stop_id, s.sequence]);
        await pool.query(
          'INSERT INTO bus_line_stop (line_id, stop_id, sequence) VALUES ?',
          [values]
        );

        // 自动更新起点站和终点站
        const firstStop = stops.find(s => s.sequence === 1) || stops[0];
        const lastStop = stops.reduce((a, b) => a.sequence > b.sequence ? a : b);
        const [stopNames] = await pool.query(
          'SELECT id, name FROM bus_stop WHERE id IN (?)',
          [[firstStop.stop_id, lastStop.stop_id]]
        );
        const nameMap = {};
        stopNames.forEach(s => { nameMap[s.id] = s.name; });
        await pool.query(
          'UPDATE bus_line SET start_station=?, end_station=? WHERE id=?',
          [nameMap[firstStop.stop_id] || '', nameMap[lastStop.stop_id] || '', lineId]
        );

        // 清除路线缓存（站点变化后需要重新规划路线）
        await pool.query(
          'UPDATE bus_line SET route_cache = NULL WHERE id = ?',
          [lineId]
        );
      }

      res.json({ code: 0, message: '保存成功' });
    } catch (error) {
      console.error('保存线路站点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 获取线路的站点列表
  router.get('/bus/line/:id/stops', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT bs.id, bs.name, bs.latitude, bs.longitude, bls.sequence
         FROM bus_stop bs
         JOIN bus_line_stop bls ON bs.id = bls.stop_id
         WHERE bls.line_id = ?
         ORDER BY bls.sequence`,
        [req.params.id]
      );
      res.json({ code: 0, data: rows });
    } catch (error) {
      console.error('获取线路站点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== 赏花点管理 API ====================

  // 上传赏花点图片
  router.post('/flower/upload', upload.single('image'), async (req, res) => {
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
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('上传图片失败:', error);
      res.status(500).json({ code: -1, message: error.message || '上传失败' });
    }
  });

  // 删除赏花点图片
  router.delete('/flower/image/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '..', 'images/flower', filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ code: 0, message: '删除成功' });
      } else {
        res.status(404).json({ code: -1, message: '文件不存在' });
      }
    } catch (error) {
      console.error('删除图片失败:', error);
      res.status(500).json({ code: -1, message: '删除失败' });
    }
  });

  // 获取赏花点列表（管理后台）
  router.get('/flower/list', async (req, res) => {
    try {
      const { page = 1, pageSize = 10, type, status, keyword } = req.query;

      let sql = 'SELECT * FROM flower_spots WHERE 1=1';
      const params = [];

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (keyword) {
        sql += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      // 获取总数
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countResult] = await pool.query(countSql, params);
      const total = countResult[0].total;

      // 分页查询
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;
      sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      params.push(pageSizeNum, offset);

      const [rows] = await pool.query(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: {
          list: rows,
          total,
          page: pageNum,
          pageSize: pageSizeNum
        }
      });
    } catch (error) {
      console.error('获取赏花点列表失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 添加赏花点
  router.post('/flower/add', async (req, res) => {
    try {
      const {
        name, type, latitude, longitude, description, best_time,
        features, rating, status, images, has_video, has_360, has_live_stream
      } = req.body;

      const [result] = await pool.query(
        `INSERT INTO flower_spots
        (name, type, latitude, longitude, description, best_time, features, rating, status, images, video_url, panorama_url, live_stream_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, type, latitude, longitude, description, best_time,
          JSON.stringify(features || []),
          rating || 0,
          status || 'upcoming',
          JSON.stringify(images || []),
          has_video ? 'placeholder' : null,
          has_360 ? 'placeholder' : null,
          has_live_stream ? 'placeholder' : null
        ]
      );

      res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
    } catch (error) {
      console.error('添加赏花点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 更新赏花点
  router.put('/flower/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name, type, latitude, longitude, description, best_time,
        features, rating, status, images, has_video, has_360, has_live_stream
      } = req.body;

      await pool.query(
        `UPDATE flower_spots SET
        name=?, type=?, latitude=?, longitude=?, description=?, best_time=?,
        features=?, rating=?, status=?, images=?, video_url=?, panorama_url=?, live_stream_url=?,
        checkin_count=?
        WHERE id=?`,
        [
          name, type, latitude, longitude, description, best_time,
          JSON.stringify(features || []),
          rating || 0,
          status || 'upcoming',
          JSON.stringify(images || []),
          has_video ? 'placeholder' : null,
          has_360 ? 'placeholder' : null,
          has_live_stream ? 'placeholder' : null,
          parseInt(req.body.checkin_count) || 0,
          id
        ]
      );

      res.json({ code: 0, message: '修改成功' });
    } catch (error) {
      console.error('修改赏花点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 删除赏花点
  router.delete('/flower/delete/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM flower_spots WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      console.error('删除赏花点失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== 校园动态管理 API ====================

  // 获取新闻列表（管理后台）
  router.get('/news/list', async (req, res) => {
    try {
      const { page = 1, pageSize = 10, keyword } = req.query;

      let sql = 'SELECT * FROM news WHERE 1=1';
      const params = [];

      if (keyword) {
        sql += ' AND (title LIKE ? OR content LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countResult] = await pool.query(countSql, params);
      const total = countResult[0].total;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(pageSizeNum, offset);

      const [rows] = await pool.query(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: { list: rows, total, page: pageNum, pageSize: pageSizeNum }
      });
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 添加新闻
  router.post('/news/add', async (req, res) => {
    try {
      const { title, content, image, author } = req.body;

      const [result] = await pool.query(
        'INSERT INTO news (title, content, image, author) VALUES (?, ?, ?, ?)',
        [title, content, image || null, author || '管理员']
      );

      res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
    } catch (error) {
      console.error('添加新闻失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 更新新闻
  router.put('/news/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, image, author } = req.body;

      await pool.query(
        'UPDATE news SET title=?, content=?, image=?, author=? WHERE id=?',
        [title, content, image || null, author || '管理员', id]
      );

      res.json({ code: 0, message: '更新成功' });
    } catch (error) {
      console.error('更新新闻失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 删除新闻
  router.delete('/news/delete/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM news WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      console.error('删除新闻失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== 赏花路线管理 API ====================

  // 获取路线列表（管理后台）
  router.get('/flower/routes/list', async (req, res) => {
    try {
      const { page = 1, pageSize = 10, keyword } = req.query;

      let sql = 'SELECT * FROM flower_routes WHERE 1=1';
      const params = [];

      if (keyword) {
        sql += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countResult] = await pool.query(countSql, params);
      const total = countResult[0].total;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;
      sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      params.push(pageSizeNum, offset);

      const [rows] = await pool.query(sql, params);

      res.json({
        code: 0,
        message: 'success',
        data: { list: rows, total, page: pageNum, pageSize: pageSizeNum }
      });
    } catch (error) {
      console.error('获取路线列表失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 添加路线
  router.post('/flower/routes/add', async (req, res) => {
    try {
      const { name, duration, distance, difficulty, spots, description, best_time, tags, highlights, tips } = req.body;

      const [result] = await pool.query(
        `INSERT INTO flower_routes (name, duration, distance, difficulty, spots, description, best_time, tags, highlights, tips)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          duration || null,
          distance || null,
          difficulty || '简单',
          JSON.stringify(spots || []),
          description || null,
          best_time || null,
          JSON.stringify(tags || []),
          JSON.stringify(highlights || []),
          JSON.stringify(tips || [])
        ]
      );

      res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
    } catch (error) {
      console.error('添加路线失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 更新路线
  router.put('/flower/routes/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, duration, distance, difficulty, spots, description, best_time, tags, highlights, tips } = req.body;

      await pool.query(
        `UPDATE flower_routes SET name=?, duration=?, distance=?, difficulty=?, spots=?, description=?, best_time=?, tags=?, highlights=?, tips=?
         WHERE id=?`,
        [
          name,
          duration || null,
          distance || null,
          difficulty || '简单',
          JSON.stringify(spots || []),
          description || null,
          best_time || null,
          JSON.stringify(tags || []),
          JSON.stringify(highlights || []),
          JSON.stringify(tips || []),
          id
        ]
      );

      res.json({ code: 0, message: '更新成功' });
    } catch (error) {
      console.error('更新路线失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 删除路线
  router.delete('/flower/routes/delete/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM flower_routes WHERE id=?', [req.params.id]);
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      console.error('删除路线失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // 获取赏花点简要列表（管理后台选择用）
  router.get('/flower/spots/simple', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, name, type, status FROM flower_spots ORDER BY id');
      res.json({ code: 0, data: rows });
    } catch (error) {
      console.error('获取赏花点列表失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  // ==================== 打卡记录管理 ====================

  // 获取打卡记录列表（管理后台）
  router.get('/flower/checkins', async (req, res) => {
    try {
      const { page = 1, pageSize = 20, spotId } = req.query;
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;

      let whereSql = '1=1';
      const params = [];

      if (spotId) {
        whereSql += ' AND fc.spot_id = ?';
        params.push(spotId);
      }

      const countSql = `SELECT COUNT(*) as total FROM flower_checkins fc WHERE ${whereSql}`;
      const [countResult] = await pool.query(countSql, params);
      const total = countResult[0].total;

      const sql = `
        SELECT fc.id, fc.images, fc.comment, fc.rating, fc.created_at,
               u.id as user_id, u.nickname, u.phone,
               fs.id as spot_id, fs.name as spot_name
        FROM flower_checkins fc
        LEFT JOIN users u ON fc.user_id = u.id
        LEFT JOIN flower_spots fs ON fc.spot_id = fs.id
        WHERE ${whereSql}
        ORDER BY fc.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(pageSizeNum, offset);
      const [rows] = await pool.query(sql, params);

      const list = rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : []
      }));

      res.json({ code: 0, message: 'success', data: { list, total, page: pageNum, pageSize: pageSizeNum } });
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  return router;
};
