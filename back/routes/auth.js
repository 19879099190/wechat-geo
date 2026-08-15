// routes/auth.js - 认证相关API

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { JWT_SECRET } = require('../config');

module.exports = (pool) => {
  /**
   * 用户注册
   * POST /api/auth/register
   */
  router.post('/register', async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          code: -1,
          message: '手机号和密码不能为空'
        });
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: -1,
          message: '手机号格式不正确'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          code: -1,
          message: '密码至少6位'
        });
      }

      // 检查手机号是否已注册
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          code: -1,
          message: '该手机号已注册'
        });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const [result] = await pool.execute(
        'INSERT INTO users (phone, password, nickname, created_at) VALUES (?, ?, ?, NOW())',
        [phone, hashedPassword, `用户${phone.slice(-4)}`]
      );

      res.json({
        code: 0,
        message: '注册成功',
        data: {
          userId: result.insertId
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 用户登录
   * POST /api/auth/login
   */
  router.post('/login', async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          code: -1,
          message: '手机号和密码不能为空'
        });
      }

      // 查询用户
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE phone = ?',
        [phone]
      );

      if (users.length === 0) {
        return res.status(400).json({
          code: -1,
          message: '用户不存在'
        });
      }

      const user = users[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          code: -1,
          message: '密码错误'
        });
      }

      // 生成token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // 更新最后登录时间
      await pool.execute(
        'UPDATE users SET last_login_at = NOW() WHERE id = ?',
        [user.id]
      );

      res.json({
        code: 0,
        message: '登录成功',
        data: {
          token,
          userInfo: {
            id: user.id,
            phone: user.phone,
            nickname: user.nickname,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取用户信息
   * GET /api/auth/userinfo
   */
  router.get('/userinfo', async (req, res) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({
          code: -1,
          message: '未登录'
        });
      }

      // 验证token
      const decoded = jwt.verify(token, JWT_SECRET);

      // 查询用户信息
      const [users] = await pool.execute(
        'SELECT id, phone, nickname, avatar FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          code: -1,
          message: '用户不存在'
        });
      }

      res.json({
        code: 0,
        message: 'success',
        data: users[0]
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(401).json({
        code: -1,
        message: 'token无效'
      });
    }
  });

  return router;
};
