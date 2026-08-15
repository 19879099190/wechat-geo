// routes/parking.js - 校园停车场 API

const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/list', async (req, res) => {
    try {
      const { type } = req.query;
      let sql = `SELECT p.* FROM parking_lot p
        INNER JOIN (
          SELECT MAX(id) AS id
          FROM parking_lot
          GROUP BY name, type, latitude, longitude
        ) latest ON latest.id = p.id`;
      const params = [];
      if (type) {
        sql += ' WHERE p.type = ?';
        params.push(type);
      }
      sql += ' ORDER BY p.available_spots DESC, p.id ASC';

      const [rows] = await pool.execute(sql, params);
      res.json({ code: 0, message: 'success', data: rows });
    } catch (error) {
      console.error('获取停车场列表失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  router.get('/detail/:id', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM parking_lot WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ code: -1, message: '停车场不存在' });
      }
      res.json({ code: 0, message: 'success', data: rows[0] });
    } catch (error) {
      console.error('获取停车场详情失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  return router;
};
