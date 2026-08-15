// routes/news.js - 校园动态API（公开访问）

const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 获取新闻详情
   * GET /api/news/:id
   */
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM news WHERE id=?', [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ code: -1, message: '新闻不存在' });
      }

      // 增加浏览量
      await pool.query('UPDATE news SET views = views + 1 WHERE id=?', [req.params.id]);

      res.json({ code: 0, data: rows[0] });
    } catch (error) {
      console.error('获取新闻详情失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  /**
   * 获取新闻列表（小程序端）
   * GET /api/news/list
   */
  router.get('/list', async (req, res) => {
    try {
      const { page = 1, pageSize = 10 } = req.query;

      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;

      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM news');
      const total = countResult[0].total;

      const [rows] = await pool.query(
        'SELECT id, title, image, author, views, likes, created_at FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [pageSizeNum, offset]
      );

      res.json({
        code: 0,
        data: { list: rows, total, page: pageNum, pageSize: pageSizeNum }
      });
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      res.status(500).json({ code: -1, message: '服务器错误' });
    }
  });

  return router;
};
