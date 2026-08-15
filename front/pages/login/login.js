// pages/login/login.js
const request = require('../../utils/request.js');

Page({
  data: {
    phone: '',
    password: '',
    isLogin: true // true为登录模式，false为注册模式
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 切换登录/注册模式
  toggleMode() {
    this.setData({
      isLogin: !this.data.isLogin,
      phone: '',
      password: ''
    });
  },

  // 输入手机号
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 登录
  handleLogin() {
    const { phone, password } = this.data;

    if (!phone || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    request.post('/auth/login', { phone, password })
      .then(res => {
        wx.hideLoading();
        if (res.code === 0) {
          // 保存token和用户信息
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('userInfo', res.data.userInfo);
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      });
  },

  // 注册
  handleRegister() {
    const { phone, password } = this.data;

    if (!phone || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '注册中...' });

    request.post('/auth/register', { phone, password })
      .then(res => {
        wx.hideLoading();
        if (res.code === 0) {
          wx.showToast({
            title: '注册成功，请登录',
            icon: 'success'
          });

          setTimeout(() => {
            this.setData({
              isLogin: true,
              password: ''
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.message || '注册失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      });
  },

  // 提交表单
  handleSubmit() {
    if (this.data.isLogin) {
      this.handleLogin();
    } else {
      this.handleRegister();
    }
  }
});

