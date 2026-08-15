// routes/admin.js - 管理员API接口

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'huanong-admin-secret-key-2024';

// 管理员认证中间件
function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: -1,
        message: '未登录'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        code: -1,
        message: '无权限访问'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: -1,
      message: 'token无效或已过期'
    });
  }
}

// 超级管理员权限检查
function superAdminAuth(req, res, next) {
  if (req.admin.role !== 'super') {
    return res.status(403).json({
      code: -1,
      message: '需要超级管理员权限'
    });
  }
  next();
}

module.exports = (pool) => {
  
  // ==================== 管理员认证 ====================
  
  /**
   * 管理员登录
   * POST /api/admin/login
   */
  router.post('/login', async (req, res) => {
    let connection;
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          code: -1,
          message: '账号和密码不能为空'
        });
      }

      // 查询管理员
      const [admins] = await pool.execute(
        'SELECT * FROM admin WHERE username = ? AND status = 1',
        [username]
      );

      if (admins.length === 0) {
        return res.status(400).json({
          code: -1,
          message: '账号不存在或已被禁用'
        });
      }

      const admin = admins[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          code: -1,
          message: '密码错误'
        });
      }

      // 生成token
      const token = jwt.sign(
        { 
          id: admin.id, 
          username: admin.username,
          role: admin.role,
          type: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 异步更新最后登录时间，不阻塞响应，并设置超时
      pool.execute(
        'UPDATE admin SET last_login_at = NOW() WHERE id = ?',
        [admin.id]
      ).catch(err => {
        console.error('更新登录时间失败:', err);
        // 不影响登录流程
      });

      res.json({
        code: 0,
        message: '登录成功',
        data: {
          token,
          adminInfo: {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            email: admin.email
          }
        }
      });
    } catch (error) {
      console.error('管理员登录失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 获取管理员信息
   * GET /api/admin/info
   */
  router.get('/info', adminAuth, async (req, res) => {
    try {
      const [admins] = await pool.execute(
        'SELECT id, username, name, email, phone, role, last_login_at FROM admin WHERE id = ?',
        [req.admin.id]
      );

      if (admins.length === 0) {
        return res.status(404).json({
          code: -1,
          message: '管理员不存在'
        });
      }

      res.json({
        code: 0,
        message: 'success',
        data: admins[0]
      });
    } catch (error) {
      console.error('获取管理员信息失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 修改密码
   * POST /api/admin/change-password
   */
  router.post('/change-password', adminAuth, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          code: -1,
          message: '参数不完整'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          code: -1,
          message: '新密码至少6位'
        });
      }

      // 查询当前密码
      const [admins] = await pool.execute(
        'SELECT password FROM admin WHERE id = ?',
        [req.admin.id]
      );

      if (admins.length === 0) {
        return res.status(404).json({
          code: -1,
          message: '管理员不存在'
        });
      }

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(oldPassword, admins[0].password);

      if (!isPasswordValid) {
        return res.status(400).json({
          code: -1,
          message: '原密码错误'
        });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await pool.execute(
        'UPDATE admin SET password = ? WHERE id = ?',
        [hashedPassword, req.admin.id]
      );

      res.json({
        code: 0,
        message: '密码修改成功'
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  // ==================== 管理员管理 ====================

  /**
   * 获取管理员列表
   * GET /api/admin/list
   */
  router.get('/list', adminAuth, superAdminAuth, async (req, res) => {
    try {
      const [admins] = await pool.execute(
        'SELECT id, username, name, email, phone, role, status, last_login_at, created_at FROM admin ORDER BY created_at DESC'
      );

      res.json({
        code: 0,
        message: 'success',
        data: admins
      });
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 添加管理员
   * POST /api/admin/add
   */
  router.post('/add', adminAuth, superAdminAuth, async (req, res) => {
    try {
      const { username, password, name, email, phone, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          code: -1,
          message: '账号和密码不能为空'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          code: -1,
          message: '密码至少6位'
        });
      }

      // 检查账号是否已存在
      const [existing] = await pool.execute(
        'SELECT id FROM admin WHERE username = ?',
        [username]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          code: -1,
          message: '账号已存在'
        });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建管理员
      const [result] = await pool.execute(
        'INSERT INTO admin (username, password, name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, name, email, phone, role || 'normal']
      );

      res.json({
        code: 0,
        message: '添加成功',
        data: {
          id: result.insertId
        }
      });
    } catch (error) {
      console.error('添加管理员失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 更新管理员信息
   * PUT /api/admin/update/:id
   */
  router.put('/update/:id', adminAuth, superAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, role, status } = req.body;

      await pool.execute(
        'UPDATE admin SET name = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?',
        [name, email, phone, role, status, id]
      );

      res.json({
        code: 0,
        message: '更新成功'
      });
    } catch (error) {
      console.error('更新管理员失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 重置管理员密码
   * POST /api/admin/reset-password/:id
   */
  router.post('/reset-password/:id', adminAuth, superAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          code: -1,
          message: '新密码至少6位'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await pool.execute(
        'UPDATE admin SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );

      res.json({
        code: 0,
        message: '密码重置成功'
      });
    } catch (error) {
      console.error('重置密码失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  /**
   * 删除管理员
   * DELETE /api/admin/delete/:id
   */
  router.delete('/delete/:id', adminAuth, superAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // 不能删除自己
      if (parseInt(id) === req.admin.id) {
        return res.status(400).json({
          code: -1,
          message: '不能删除自己'
        });
      }

      await pool.execute('DELETE FROM admin WHERE id = ?', [id]);

      res.json({
        code: 0,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除管理员失败:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  });

  // ==================== 数据统计 ====================

  /**
   * 获取系统统计数据
   * GET /api/admin/stats
   */
  router.get('/stats', adminAuth, async (req, res) => {
    try {
      // 用户总数
      const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM user');
      
      // POI总数
      const [poiCount] = await pool.execute('SELECT COUNT(*) as count FROM poi');
      
      // 充电桩总数
      const [chargingCount] = await pool.execute('SELECT COUNT(*) as count FROM charging_station');
      
      // 校巴线路总数
      const [busCount] = await pool.execute('SELECT COUNT(*) as count FROM bus_line');
      
      // 今日新增用户
      const [todayUsers] = await pool.execute(
        'SELECT COUNT(*) as count FROM user WHERE DATE(created_at) = CURDATE()'
      );
      
      // 今日充电次数
      const [todayCharging] = await pool.execute(
        'SELECT COUNT(*) as count FROM charging_reservation WHERE DATE(created_at) = CURDATE()'
      );

      res.json({
        code: 0,
        message: 'success',
        data: {
          userCount: userCount[0].count,
          poiCount: poiCount[0].count,
          chargingCount: chargingCount[0].count,
          busCount: busCount[0].count,
          todayUsers: todayUsers[0].count,
          todayCharging: todayCharging[0].count
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
