// 密码显示/隐藏切换
    document.getElementById('togglePassword').addEventListener('click', function() {
      const passwordInput = document.getElementById('password');
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      this.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // 显示错误消息
    function showError(message) {
      const errorDiv = document.getElementById('errorMessage');
      errorDiv.textContent = message;
      errorDiv.classList.add('show');
      setTimeout(() => {
        errorDiv.classList.remove('show');
      }, 5000);
    }

    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;
      const loginBtn = document.getElementById('loginBtn');

      if (!username || !password) {
        showError('请输入账号和密码');
        return;
      }

      // 禁用按钮，显示加载状态
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="loading"></span>登录中...';

      try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
          // 移除 credentials: 'include' 以避免 CORS 问题
        });

        const result = await response.json();

        if (result.code === 0) {
          // 登录成功
          const { token, adminInfo } = result.data;

          // 保存token和管理员信息（先清除另一个存储，防止旧token干扰）
          if (rememberMe) {
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_info');
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_info', JSON.stringify(adminInfo));
            // 设置cookie（7天过期）
            document.cookie = `admin_token=${token}; max-age=${7*24*60*60}; path=/`;
          } else {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_info');
            sessionStorage.setItem('admin_token', token);
            sessionStorage.setItem('admin_info', JSON.stringify(adminInfo));
            // 设置session cookie
            document.cookie = `admin_token=${token}; path=/`;
          }

          // 获取重定向URL
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect') || 'admin-dashboard.html';
          
          // 跳转到管理后台
          window.location.href = redirect;
        } else {
          showError(result.message || '登录失败');
          loginBtn.disabled = false;
          loginBtn.textContent = '登录';
        }
      } catch (error) {
        console.error('登录错误:', error);
        showError('网络错误，请检查服务器是否启动');
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
      }
    });

    // 回车键登录
    document.getElementById('password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
      }
    });

    // 检查是否已登录
    window.addEventListener('load', () => {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      if (token) {
        // 验证token是否有效
        fetch(`${API_BASE_URL}/admin/info`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(result => {
          if (result.code === 0) {
            // token有效，直接跳转
            window.location.href = 'admin-dashboard.html';
          }
        })
        .catch(err => {
          console.log('token验证失败:', err);
        });
      }
    });
