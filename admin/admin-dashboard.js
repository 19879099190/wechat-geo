let currentAdmin = null;
    let adminToken = null;

    // 获取token
    function getToken() {
      return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    }

    // 检查登录状态
    async function checkAuth() {
      adminToken = getToken();
      
      if (!adminToken) {
        window.location.href = 'admin-login.html';
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/info`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        const result = await response.json();

        if (result.code === 0) {
          currentAdmin = result.data;
          document.getElementById('adminName').textContent = currentAdmin.name || currentAdmin.username;
          
          const roleEl = document.getElementById('adminRole');
          if (currentAdmin.role === 'super') {
            roleEl.textContent = '超级管理员';
            roleEl.className = 'badge badge-super';
          } else {
            roleEl.textContent = '普通管理员';
            roleEl.className = 'badge badge-normal';
            // 普通管理员隐藏管理员管理功能
            document.getElementById('addAdminBtn').style.display = 'none';
          }

          loadStats();
          loadAdmins();
          loadUsers();
        } else {
          window.location.href = 'admin-login.html';
        }
      } catch (error) {
        console.error('验证失败:', error);
        window.location.href = 'admin-login.html';
      }
    }

    // 退出登录
    function logout() {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_info');
      // 清除cookie
      document.cookie = 'admin_token=; max-age=0; path=/';
      window.location.href = 'admin-login.html';
    }

    // 显示消息
    function showAlert(message, type = 'success') {
      const alert = document.getElementById('alert');
      alert.textContent = message;
      alert.className = `alert alert-${type} show`;
      setTimeout(() => {
        alert.classList.remove('show');
      }, 3000);
    }

    // 切换标签
    function switchTab(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');

      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`${tab}-section`).classList.add('active');

      // 加载对应数据
      if (tab === 'poi') loadPoi();
      else if (tab === 'charging') loadCharging();
      else if (tab === 'bus') loadBus();
      else if (tab === 'busstops') loadBusStops();
      else if (tab === 'flower') loadFlower();
      else if (tab === 'news') loadNews();
      else if (tab === 'routes') loadRoutes();
      else if (tab === 'checkins') loadCheckins();
    }

    // POI管理函数
    function showAddPoiModal() {
      document.getElementById('poiModalTitle').textContent = '添加POI';
      document.getElementById('poiForm').reset();
      document.getElementById('poiId').value = '';
      document.getElementById('addPoiModal').classList.add('show');
    }

    function closePoiModal() {
      document.getElementById('addPoiModal').classList.remove('show');
    }

    async function editPoi(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/poi/detail/${id}`);
        const result = await response.json();

        if (result.code === 0) {
          const poi = result.data;
          document.getElementById('poiModalTitle').textContent = '编辑POI';
          document.getElementById('poiId').value = poi.id;
          document.getElementById('poiName').value = poi.name;
          document.getElementById('poiType').value = poi.type;
          document.getElementById('poiLatitude').value = poi.latitude;
          document.getElementById('poiLongitude').value = poi.longitude;
          document.getElementById('poiDescription').value = poi.description || '';
          document.getElementById('poiComment').value = poi.comment || '';
          document.getElementById('poiRating').value = poi.rating || 0;
          document.getElementById('poiOpenTime').value = poi.open_time || '';
          document.getElementById('addPoiModal').classList.add('show');
        }
      } catch (error) {
        showAlert('获取POI信息失败', 'error');
      }
    }

    async function deletePoi(id) {
      if (!confirm('确定要删除该POI吗？')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/poi/delete/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('删除成功');
          loadPoi();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    async function searchPoi() {
      const keyword = document.getElementById('poiSearchInput').value.trim();
      const type = document.getElementById('poiTypeFilter').value;

      try {
        let url = `${API_BASE_URL}/poi/list?pageSize=1000`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (type) url += `&type=${type}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('poiTableBody');
          const items = result.data.list || result.data;
          tbody.innerHTML = items.map(poi => `
            <tr>
              <td>${poi.id}</td>
              <td>${poi.name}</td>
              <td>${getPoiTypeName(poi.type)}</td>
              <td>${poi.latitude}, ${poi.longitude}</td>
              <td>${poi.rating || 0} ⭐</td>
              <td>
                <button class="btn btn-primary" onclick="editPoi(${poi.id})">编辑</button>
                <button class="btn btn-danger" onclick="deletePoi(${poi.id})">删除</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        showAlert('搜索失败', 'error');
      }
    }

    // 充电桩管理函数
    function showAddChargingModal() {
      document.getElementById('chargingModalTitle').textContent = '添加充电桩';
      document.getElementById('chargingForm').reset();
      document.getElementById('chargingId').value = '';
      document.getElementById('addChargingModal').classList.add('show');
    }

    function closeChargingModal() {
      document.getElementById('addChargingModal').classList.remove('show');
    }

    async function editCharging(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/charging/station/${id}`);
        const result = await response.json();

        if (result.code === 0) {
          const station = result.data;
          document.getElementById('chargingModalTitle').textContent = '编辑充电桩';
          document.getElementById('chargingId').value = station.id;
          document.getElementById('chargingName').value = station.name;
          document.getElementById('chargingLocation').value = station.location;
          document.getElementById('chargingLatitude').value = station.latitude;
          document.getElementById('chargingLongitude').value = station.longitude;
          document.getElementById('chargingStatus').value = station.status;
          document.getElementById('chargingPower').value = station.power;
          document.getElementById('chargingTotalSlots').value = station.total_slots;
          document.getElementById('chargingAvailableSlots').value = station.available_slots;
          document.getElementById('chargingPrice').value = station.price;
          document.getElementById('addChargingModal').classList.add('show');
        }
      } catch (error) {
        showAlert('获取充电桩信息失败', 'error');
      }
    }

    async function deleteCharging(id) {
      if (!confirm('确定要删除该充电桩吗？')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/charging/delete/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('删除成功');
          loadCharging();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    // 校巴管理函数
    function showAddBusModal() {
      document.getElementById('busModalTitle').textContent = '添加校巴线路';
      document.getElementById('busForm').reset();
      document.getElementById('busId').value = '';
      document.getElementById('addBusModal').classList.add('show');
    }

    function closeBusModal() {
      document.getElementById('addBusModal').classList.remove('show');
    }

    async function editBus(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/bus/line/${id}`);
        const result = await response.json();

        if (result.code === 0) {
          const bus = result.data;
          document.getElementById('busModalTitle').textContent = '编辑校巴线路';
          document.getElementById('busId').value = bus.id;
          document.getElementById('busNumber').value = bus.number;
          document.getElementById('busName').value = bus.name;
          document.getElementById('busStartStation').value = bus.start_station;
          document.getElementById('busEndStation').value = bus.end_station;
          document.getElementById('busOperatingTime').value = bus.operating_time || '';
          document.getElementById('busIntervalMinutes').value = bus.interval_minutes;
          document.getElementById('addBusModal').classList.add('show');
        }
      } catch (error) {
        showAlert('获取校巴信息失败', 'error');
      }
    }

    async function deleteBus(id) {
      if (!confirm('确定要删除该校巴线路吗？（关联的站点配置也会被清除）')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/bus/delete/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('删除成功');
          loadBus();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    // ==================== 站点管理函数 ====================
    let allBusStops = [];

    async function loadBusStops() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/bus/stops`);
        const result = await response.json();
        if (result.code === 0) {
          allBusStops = result.data;
          const tbody = document.getElementById('busStopsTableBody');
          tbody.innerHTML = result.data.map(stop => `
            <tr>
              <td>${stop.id}</td>
              <td>${stop.name}</td>
              <td>${stop.latitude}</td>
              <td>${stop.longitude}</td>
              <td>-</td>
              <td>
                <button class="btn btn-sm btn-primary" onclick="editStop(${stop.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteStop(${stop.id})">删除</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        console.error('加载站点列表失败:', error);
      }
    }

    function showAddStopModal() {
      document.getElementById('stopModalTitle').textContent = '添加站点';
      document.getElementById('stopForm').reset();
      document.getElementById('stopId').value = '';
      document.getElementById('addStopModal').classList.add('show');
    }

    function closeStopModal() {
      document.getElementById('addStopModal').classList.remove('show');
    }

    async function editStop(id) {
      const stop = allBusStops.find(s => s.id === id);
      if (!stop) return;
      document.getElementById('stopModalTitle').textContent = '编辑站点';
      document.getElementById('stopId').value = stop.id;
      document.getElementById('stopName').value = stop.name;
      document.getElementById('stopLatitude').value = stop.latitude;
      document.getElementById('stopLongitude').value = stop.longitude;
      document.getElementById('addStopModal').classList.add('show');
    }

    async function deleteStop(id) {
      if (!confirm('确定要删除该站点吗？')) return;
      try {
        const response = await fetch(`${API_BASE_URL}/admin/bus/stops/delete/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.code === 0) {
          showAlert('删除成功');
          loadBusStops();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    document.getElementById('stopForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('stopId').value;
      const data = {
        name: document.getElementById('stopName').value,
        latitude: parseFloat(document.getElementById('stopLatitude').value),
        longitude: parseFloat(document.getElementById('stopLongitude').value)
      };

      try {
        const url = id ? `${API_BASE_URL}/admin/bus/stops/update/${id}` : `${API_BASE_URL}/admin/bus/stops/add`;
        const response = await fetch(url, {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.code === 0) {
          showAlert(id ? '修改成功' : '添加成功');
          closeStopModal();
          loadBusStops();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('操作失败', 'error');
      }
    });

    // ==================== 线路站点配置 ====================
    let currentLineId = null;
    let lineSelectedStops = []; // [{stop_id, sequence, name, latitude, longitude}]

    async function configLineStops(lineId, lineName) {
      currentLineId = lineId;
      document.getElementById('lineStopsTitle').textContent = `配置站点 - ${lineName}`;

      // 加载所有站点
      try {
        const [stopsRes, lineStopsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/bus/stops`).then(r => r.json()),
          fetch(`${API_BASE_URL}/admin/bus/line/${lineId}/stops`).then(r => r.json())
        ]);

        allBusStops = stopsRes.code === 0 ? stopsRes.data : [];
        lineSelectedStops = lineStopsRes.code === 0 ? lineStopsRes.data.map(s => ({
          stop_id: s.id, sequence: s.sequence, name: s.name, latitude: s.latitude, longitude: s.longitude
        })) : [];

        renderAvailableStops();
        renderSelectedStops();
        document.getElementById('lineStopsModal').classList.add('show');
      } catch (error) {
        showAlert('加载站点信息失败', 'error');
      }
    }

    function closeLineStopsModal() {
      document.getElementById('lineStopsModal').classList.remove('show');
    }

    function renderAvailableStops() {
      const container = document.getElementById('availableStopsList');
      const selectedIds = lineSelectedStops.map(s => s.stop_id);
      const available = allBusStops.filter(s => !selectedIds.includes(s.id));

      if (!available.length) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">所有站点已选择</p>';
        return;
      }
      container.innerHTML = available.map(s => `
        <div onclick="addStopToLine(${s.id}, '${s.name.replace(/'/g, "\\'")}', ${s.latitude}, ${s.longitude})"
             style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;"
             onmouseover="this.style.background='#e3f2fd'" onmouseout="this.style.background=''">
          <span>${s.name}</span>
          <span style="color:#4caf50;font-weight:bold;">+</span>
        </div>
      `).join('');
    }

    function renderSelectedStops() {
      const container = document.getElementById('selectedStopsList');
      if (!lineSelectedStops.length) {
        container.innerHTML = '<p style="color:#ccc;text-align:center;padding:20px;">点击左侧站点添加</p>';
        return;
      }
      container.innerHTML = lineSelectedStops.map((s, i) => `
        <div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:#f8f9fa;border-radius:6px;margin-bottom:6px;">
          <span style="background:#1976d2;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;">${i + 1}</span>
          <span style="flex:1;font-size:13px;">${s.name}</span>
          <button type="button" onclick="moveLineStop(${i},-1)" style="padding:2px 6px;font-size:11px;cursor:pointer;" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" onclick="moveLineStop(${i},1)" style="padding:2px 6px;font-size:11px;cursor:pointer;" ${i === lineSelectedStops.length - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" onclick="removeStopFromLine(${i})" style="padding:2px 6px;font-size:11px;color:#e53935;cursor:pointer;">✕</button>
        </div>
      `).join('');
    }

    function addStopToLine(stopId, name, lat, lng) {
      lineSelectedStops.push({ stop_id: stopId, sequence: lineSelectedStops.length + 1, name, latitude: lat, longitude: lng });
      renderAvailableStops();
      renderSelectedStops();
    }

    function removeStopFromLine(index) {
      lineSelectedStops.splice(index, 1);
      lineSelectedStops.forEach((s, i) => { s.sequence = i + 1; });
      renderAvailableStops();
      renderSelectedStops();
    }

    function moveLineStop(index, direction) {
      const newIdx = index + direction;
      if (newIdx < 0 || newIdx >= lineSelectedStops.length) return;
      [lineSelectedStops[index], lineSelectedStops[newIdx]] = [lineSelectedStops[newIdx], lineSelectedStops[index]];
      lineSelectedStops.forEach((s, i) => { s.sequence = i + 1; });
      renderSelectedStops();
    }

    async function saveLineStops() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/bus/line/${currentLineId}/stops`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stops: lineSelectedStops.map(s => ({ stop_id: s.stop_id, sequence: s.sequence })) })
        });
        const result = await response.json();
        if (result.code === 0) {
          showAlert('站点配置保存成功');
          closeLineStopsModal();
          loadBus();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('保存失败', 'error');
      }
    }

    // 赏花点管理函数
    let uploadedImages = []; // 存储已上传的图片URL

    function showAddFlowerModal() {
      document.getElementById('flowerModalTitle').textContent = '添加赏花点';
      document.getElementById('flowerForm').reset();
      document.getElementById('flowerId').value = '';
      uploadedImages = [];
      document.getElementById('flowerImagePreview').innerHTML = '';
      document.getElementById('flowerImages').value = '';
      document.getElementById('addFlowerModal').classList.add('show');
    }

    function closeFlowerModal() {
      document.getElementById('addFlowerModal').classList.remove('show');
      uploadedImages = [];
    }

    // 图片上传处理
    document.getElementById('flowerImageUpload').addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files.length) return;

      for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
          showAlert(`图片 ${file.name} 超过5MB`, 'error');
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch(`${API_BASE_URL}/admin/flower/upload`, {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (result.code === 0) {
            uploadedImages.push(result.data.url);
            addImagePreview(result.data.url, result.data.filename);
            updateImagesInput();
          } else {
            showAlert(result.message, 'error');
          }
        } catch (error) {
          showAlert('上传失败', 'error');
        }
      }

      e.target.value = ''; // 清空input，允许重复上传同一文件
    });

    // 添加图片预览
    function addImagePreview(url, filename) {
      const preview = document.getElementById('flowerImagePreview');
      const div = document.createElement('div');
      div.style.cssText = 'position: relative; width: 100px; height: 100px;';
      div.innerHTML = `
        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
        <button type="button" onclick="removeImage('${url}', '${filename}')"
          style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px;
          border-radius: 50%; background: #f56c6c; color: white; border: none;
          cursor: pointer; font-size: 16px; line-height: 1;">×</button>
      `;
      preview.appendChild(div);
    }

    // 删除图片
    async function removeImage(url, filename) {
      if (!confirm('确定删除这张图片吗？')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/flower/image/${filename}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 0) {
          uploadedImages = uploadedImages.filter(img => img !== url);
          updateImagesInput();
          // 重新渲染预览
          const preview = document.getElementById('flowerImagePreview');
          preview.innerHTML = '';
          uploadedImages.forEach(imgUrl => {
            const fname = imgUrl.split('/').pop();
            addImagePreview(imgUrl, fname);
          });
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    // 更新图片URL输入框
    function updateImagesInput() {
      document.getElementById('flowerImages').value = uploadedImages.join(',');
    }

    async function editFlower(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/flower/spot/${id}`);
        const result = await response.json();

        if (result.code === 0) {
          const flower = result.data;
          document.getElementById('flowerModalTitle').textContent = '编辑赏花点';
          document.getElementById('flowerId').value = flower.id;
          document.getElementById('flowerName').value = flower.name;
          document.getElementById('flowerType').value = flower.type;
          document.getElementById('flowerLatitude').value = flower.latitude;
          document.getElementById('flowerLongitude').value = flower.longitude;
          document.getElementById('flowerDescription').value = flower.description || '';
          document.getElementById('flowerBestTime').value = flower.best_time || '';

          // 处理 features 数组
          const features = Array.isArray(flower.features) ? flower.features : JSON.parse(flower.features || '[]');
          document.getElementById('flowerFeatures').value = features.join(',');

          document.getElementById('flowerRating').value = flower.rating || 0;
          document.getElementById('flowerStatus').value = flower.status || 'upcoming';
          document.getElementById('flowerCheckinCount').value = flower.checkin_count || 0;

          // 处理 images 数组并显示预览
          const images = Array.isArray(flower.images) ? flower.images : JSON.parse(flower.images || '[]');
          uploadedImages = images;
          document.getElementById('flowerImages').value = images.join(',');

          // 显示已有图片预览
          const preview = document.getElementById('flowerImagePreview');
          preview.innerHTML = '';
          images.forEach(url => {
            const filename = url.split('/').pop();
            addImagePreview(url, filename);
          });

          document.getElementById('flowerHasVideo').checked = !!flower.has_video;
          document.getElementById('flowerHas360').checked = !!flower.has_360;
          document.getElementById('flowerHasLiveStream').checked = !!flower.has_live_stream;

          document.getElementById('addFlowerModal').classList.add('show');
        }
      } catch (error) {
        showAlert('获取赏花点信息失败', 'error');
      }
    }

    async function deleteFlower(id) {
      if (!confirm('确定要删除该赏花点吗？')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/flower/delete/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('删除成功');
          loadFlower();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    // 数据库管理函数
    async function showAllTables() {
      const dbResult = document.getElementById('dbResult');
      dbResult.innerHTML = '<p>⏳ 加载中...</p>';
      dbResult.style.display = 'block';

      try {
        const response = await fetch(`${API_BASE_URL}/poi/list?pageSize=1`);
        const result = await response.json();

        let html = '<h3>📋 数据库表列表</h3>';
        html += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
        html += '<thead><tr><th style="padding: 10px; border-bottom: 2px solid #ddd;">表名</th><th style="padding: 10px; border-bottom: 2px solid #ddd;">说明</th></tr></thead>';
        html += '<tbody>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">admin</td><td style="padding: 10px; border-bottom: 1px solid #eee;">管理员表</td></tr>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">user</td><td style="padding: 10px; border-bottom: 1px solid #eee;">用户表</td></tr>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">poi</td><td style="padding: 10px; border-bottom: 1px solid #eee;">POI表</td></tr>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">user_favorites</td><td style="padding: 10px; border-bottom: 1px solid #eee;">用户收藏表</td></tr>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">charging_station</td><td style="padding: 10px; border-bottom: 1px solid #eee;">充电桩表</td></tr>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">charging_reservation</td><td style="padding: 10px; border-bottom: 1px solid #eee;">充电预约表</td></tr>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">bus_line</td><td style="padding: 10px; border-bottom: 1px solid #eee;">校巴线路表</td></tr>';
        html += '<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">bus_stop</td><td style="padding: 10px; border-bottom: 1px solid #eee;">校巴站点表</td></tr>';
        html += '</tbody></table>';

        dbResult.innerHTML = html;
      } catch (error) {
        dbResult.innerHTML = '<p style="color: #e74c3c;">❌ 加载失败: ' + error.message + '</p>';
      }
    }

    async function showTableStats() {
      const dbResult = document.getElementById('dbResult');
      dbResult.innerHTML = '<p>⏳ 统计中...</p>';
      dbResult.style.display = 'block';

      try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        const result = await response.json();

        if (result.code === 0) {
          const data = result.data;
          let html = '<h3>📊 数据统计</h3>';
          html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">';
          html += `<div style="padding: 15px; background: #f0f9ff; border-radius: 8px;"><strong>用户总数:</strong> ${data.userCount}</div>`;
          html += `<div style="padding: 15px; background: #f0fdf4; border-radius: 8px;"><strong>POI总数:</strong> ${data.poiCount}</div>`;
          html += `<div style="padding: 15px; background: #fef3c7; border-radius: 8px;"><strong>充电桩总数:</strong> ${data.chargingCount}</div>`;
          html += `<div style="padding: 15px; background: #fce7f3; border-radius: 8px;"><strong>校巴线路:</strong> ${data.busCount}</div>`;
          html += `<div style="padding: 15px; background: #e0e7ff; border-radius: 8px;"><strong>今日新增用户:</strong> ${data.todayUsers}</div>`;
          html += `<div style="padding: 15px; background: #ddd6fe; border-radius: 8px;"><strong>今日充电次数:</strong> ${data.todayCharging}</div>`;
          html += '</div>';

          dbResult.innerHTML = html;
        }
      } catch (error) {
        dbResult.innerHTML = '<p style="color: #e74c3c;">❌ 统计失败: ' + error.message + '</p>';
      }
    }

    async function showFavoriteStats() {
      const dbResult = document.getElementById('dbResult');
      dbResult.innerHTML = '<p>⏳ 加载中...</p>';
      dbResult.style.display = 'block';

      try {
        const response = await fetch(`${API_BASE_URL}/admin/favorites/stats`);
        const result = await response.json();

        if (result.code === 0) {
          const data = result.data;
          let html = '<h3>❤️ 收藏统计</h3>';
          html += `<p style="margin: 15px 0;">总收藏数: <strong style="color: #667eea; font-size: 20px;">${data.totalCount}</strong></p>`;

          if (data.popularPoi && data.popularPoi.length > 0) {
            html += '<h4 style="margin-top: 20px;">🔥 最受欢迎的POI (Top 10)</h4>';
            html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
            html += '<thead><tr><th style="padding: 10px; border-bottom: 2px solid #ddd;">名称</th><th style="padding: 10px; border-bottom: 2px solid #ddd;">类型</th><th style="padding: 10px; border-bottom: 2px solid #ddd;">收藏数</th></tr></thead>';
            html += '<tbody>';
            data.popularPoi.forEach(poi => {
              html += `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">${poi.name}</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${getPoiTypeName(poi.type)}</td><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${poi.favorite_count}</strong></td></tr>`;
            });
            html += '</tbody></table>';
          }

          dbResult.innerHTML = html;
        }
      } catch (error) {
        dbResult.innerHTML = '<p style="color: #e74c3c;">❌ 加载失败: ' + error.message + '</p>';
      }
    }

    async function showPoiStats() {
      const dbResult = document.getElementById('dbResult');
      dbResult.innerHTML = '<p>⏳ 加载中...</p>';
      dbResult.style.display = 'block';

      try {
        const response = await fetch(`${API_BASE_URL}/poi/list?pageSize=1000`);
        const result = await response.json();

        if (result.code === 0) {
          const items = result.data.list || result.data;
          const typeCount = {};
          items.forEach(poi => {
            typeCount[poi.type] = (typeCount[poi.type] || 0) + 1;
          });

          let html = '<h3>📍 POI统计</h3>';
          html += `<p style="margin: 15px 0;">总POI数: <strong style="color: #667eea; font-size: 20px;">${items.length}</strong></p>`;
          html += '<h4 style="margin-top: 20px;">按类型统计</h4>';
          html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">';
          
          for (const [type, count] of Object.entries(typeCount)) {
            html += `<div style="padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
              <strong>${getPoiTypeName(type)}:</strong> ${count}
            </div>`;
          }
          
          html += '</div>';
          dbResult.innerHTML = html;
        }
      } catch (error) {
        dbResult.innerHTML = '<p style="color: #e74c3c;">❌ 加载失败: ' + error.message + '</p>';
      }
    }

    // 加载统计数据
    async function loadStats() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        const result = await response.json();

        if (result.code === 0) {
          const data = result.data;
          document.getElementById('userCount').textContent = data.userCount;
          document.getElementById('poiCount').textContent = data.poiCount;
          document.getElementById('chargingCount').textContent = data.chargingCount;
          document.getElementById('busCount').textContent = data.busCount;
          document.getElementById('todayUsers').textContent = data.todayUsers;
          document.getElementById('todayCharging').textContent = data.todayCharging;
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    }

    // 加载管理员列表
    async function loadAdmins() {
      if (currentAdmin.role !== 'super') return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/list`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('adminsTableBody');
          tbody.innerHTML = result.data.map(admin => `
            <tr>
              <td>${admin.id}</td>
              <td>${admin.username}</td>
              <td>${admin.name || '-'}</td>
              <td>
                <span class="badge ${admin.role === 'super' ? 'badge-super' : 'badge-normal'}">
                  ${admin.role === 'super' ? '超级管理员' : '普通管理员'}
                </span>
              </td>
              <td>
                <span class="badge ${admin.status === 1 ? 'badge-active' : 'badge-inactive'}">
                  ${admin.status === 1 ? '启用' : '禁用'}
                </span>
              </td>
              <td>${admin.last_login_at ? new Date(admin.last_login_at).toLocaleString('zh-CN') : '从未登录'}</td>
              <td>
                ${admin.id !== currentAdmin.id ? `
                  <button class="btn btn-danger" onclick="deleteAdmin(${admin.id})">删除</button>
                ` : '-'}
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        console.error('加载管理员列表失败:', error);
      }
    }

    // 加载用户列表
    async function loadUsers() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('usersTableBody');
          tbody.innerHTML = result.data.map(user => `
            <tr>
              <td>${user.id}</td>
              <td>${user.nickname}</td>
              <td>${user.phone || '-'}</td>
              <td>${user.favorite_count || 0}</td>
              <td>${new Date(user.created_at).toLocaleString('zh-CN')}</td>
              <td>${user.last_login_at ? new Date(user.last_login_at).toLocaleString('zh-CN') : '从未登录'}</td>
            </tr>
          `).join('');
        }
      } catch (error) {
        console.error('加载用户列表失败:', error);
      }
    }

    // 加载POI列表
    async function loadPoi() {
      try {
        const response = await fetch(`${API_BASE_URL}/poi/list?pageSize=1000`);
        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('poiTableBody');
          const items = result.data.list || result.data;
          tbody.innerHTML = items.map(poi => `
            <tr>
              <td>${poi.id}</td>
              <td>${poi.name}</td>
              <td>${getPoiTypeName(poi.type)}</td>
              <td>${poi.latitude}, ${poi.longitude}</td>
              <td>${poi.rating || 0} ⭐</td>
              <td>
                <button class="btn btn-primary" onclick="editPoi(${poi.id})">编辑</button>
                <button class="btn btn-danger" onclick="deletePoi(${poi.id})">删除</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        console.error('加载POI列表失败:', error);
      }
    }

    // 加载充电桩列表
    async function loadCharging() {
      try {
        const response = await fetch(`${API_BASE_URL}/charging/stations`);
        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('chargingTableBody');
          const items = result.data;
          tbody.innerHTML = items.map(station => `
            <tr>
              <td>${station.id}</td>
              <td>${station.name}</td>
              <td>${station.location}</td>
              <td>${getChargingStatusName(station.status)}</td>
              <td>${station.available_slots}/${station.total_slots}</td>
              <td>¥${station.price}/度</td>
              <td>
                <button class="btn btn-primary" onclick="editCharging(${station.id})">编辑</button>
                <button class="btn btn-danger" onclick="deleteCharging(${station.id})">删除</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        console.error('加载充电桩列表失败:', error);
      }
    }

    // 加载校巴列表
    async function loadBus() {
      try {
        const response = await fetch(`${API_BASE_URL}/bus/lines`);
        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('busTableBody');
          const items = result.data;
          tbody.innerHTML = items.map(bus => {
            const stopCount = bus.stations ? bus.stations.length : 0;
            return `
            <tr>
              <td>${bus.id}</td>
              <td>${bus.number}路</td>
              <td>${bus.name}</td>
              <td>${bus.start_station || '-'} → ${bus.end_station || '-'}</td>
              <td>${stopCount}个</td>
              <td>${bus.operating_time || '-'}</td>
              <td>${bus.interval_minutes}分钟</td>
              <td>
                <button class="btn btn-sm btn-primary" onclick="editBus(${bus.id})">编辑</button>
                <button class="btn btn-sm" style="background:#4caf50;color:#fff;" onclick="configLineStops(${bus.id}, '${bus.name.replace(/'/g, "\\'")}')">站点</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBus(${bus.id})">删除</button>
              </td>
            </tr>`;
          }).join('');
        }
      } catch (error) {
        console.error('加载校巴列表失败:', error);
      }
    }

    // 加载赏花点列表
    let checkinPage = 1;

    async function loadCheckins(page = 1) {
      checkinPage = page;
      const spotId = document.getElementById('checkinSpotFilter').value;
      try {
        const params = new URLSearchParams({ page, pageSize: 20 });
        if (spotId) params.append('spotId', spotId);
        const response = await fetch(`${API_BASE_URL}/admin/flower/checkins?${params}`);
        const result = await response.json();
        if (result.code !== 0) return;

        const { list, total } = result.data;
        document.getElementById('checkinTotal').textContent = `共 ${total} 条`;

        const tbody = document.getElementById('checkinsTableBody');
        tbody.innerHTML = list.map(c => {
          const stars = '★'.repeat(c.rating || 0) + '☆'.repeat(5 - (c.rating || 0));
          const imgs = (c.images || []).map(url =>
            `<img src="${API_BASE_URL.replace('/api', '')}${url}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin:2px;cursor:pointer;" onclick="window.open('${API_BASE_URL.replace('/api', '')}${url}')">`
          ).join('');
          const time = new Date(c.created_at).toLocaleString('zh-CN');
          return `<tr>
            <td>${c.id}</td>
            <td>${c.nickname || '匿名'}${c.phone ? '<br><small style="color:#999">' + c.phone + '</small>' : ''}</td>
            <td>${c.spot_name || '-'}</td>
            <td>${imgs || '-'}</td>
            <td style="color:#f59e0b">${stars}</td>
            <td>${c.comment || '-'}</td>
            <td>${time}</td>
          </tr>`;
        }).join('');

        // 分页
        const totalPages = Math.ceil(total / 20);
        const pagination = document.getElementById('checkinsPagination');
        if (totalPages <= 1) {
          pagination.innerHTML = '';
        } else {
          let btns = '';
          for (let i = 1; i <= totalPages; i++) {
            btns += `<button onclick="loadCheckins(${i})" style="margin:2px;padding:4px 10px;${i === page ? 'font-weight:bold;background:#3b82f6;color:#fff;' : ''}border:1px solid #ddd;border-radius:4px;cursor:pointer;">${i}</button>`;
          }
          pagination.innerHTML = btns;
        }

        // 填充赏花点筛选下拉（只在第一次加载时）
        const select = document.getElementById('checkinSpotFilter');
        if (select.options.length === 1) {
          const spotsRes = await fetch(`${API_BASE_URL}/admin/flower/list?pageSize=100`);
          const spotsData = await spotsRes.json();
          if (spotsData.code === 0) {
            spotsData.data.list.forEach(s => {
              const opt = document.createElement('option');
              opt.value = s.id;
              opt.textContent = s.name;
              select.appendChild(opt);
            });
          }
        }
      } catch (error) {
        console.error('加载打卡记录失败:', error);
      }
    }

    async function loadFlower() {      try {
        const response = await fetch(`${API_BASE_URL}/admin/flower/list?pageSize=100`);
        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('flowerTableBody');
          const items = result.data.list || [];
          tbody.innerHTML = items.map(flower => `
            <tr>
              <td>${flower.id}</td>
              <td>${flower.name}</td>
              <td>${flower.type}</td>
              <td>${flower.latitude}, ${flower.longitude}</td>
              <td>${flower.best_time || '-'}</td>
              <td>${flower.rating || 0}</td>
              <td>${flower.checkin_count || 0} 次</td>
              <td><span style="color: ${flower.status === 'blooming' ? '#10b981' : '#f59e0b'}">${flower.status === 'blooming' ? '盛开中' : '即将开放'}</span></td>
              <td>
                <button class="btn btn-primary" onclick="editFlower(${flower.id})">编辑</button>
                <button class="btn btn-danger" onclick="deleteFlower(${flower.id})">删除</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        console.error('加载赏花点列表失败:', error);
      }
    }

    // 辅助函数
    function getPoiTypeName(type) {
      const typeMap = {
        'canteen': '食堂',
        'library': '图书馆',
        'classroom': '教学楼',
        'dormitory': '宿舍',
        'scenic': '景点',
        'sports': '运动场馆',
        'office': '办公楼',
        'shop': '商店'
      };
      return typeMap[type] || type;
    }

    function getChargingStatusName(status) {
      const statusMap = {
        0: '🟢 空闲',
        1: '🔵 充电中',
        2: '🟡 已预约',
        3: '🔴 故障'
      };
      return statusMap[status] || '未知';
    }

    // 显示添加管理员模态框
    function showAddAdminModal() {
      document.getElementById('addAdminModal').classList.add('show');
    }

    // 关闭添加管理员模态框
    function closeAddAdminModal() {
      document.getElementById('addAdminModal').classList.remove('show');
      document.getElementById('addAdminForm').reset();
    }

    // 添加管理员表单提交
    document.getElementById('addAdminForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch(`${API_BASE_URL}/admin/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('添加成功');
          closeAddAdminModal();
          loadAdmins();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('添加失败', 'error');
      }
    });

    // 删除管理员
    async function deleteAdmin(id) {
      if (!confirm('确定要删除该管理员吗？')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('删除成功');
          loadAdmins();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    // POI表单提交
    document.getElementById('poiForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const id = data.id;
      delete data.id;

      try {
        const url = id ? `${API_BASE_URL}/admin/poi/update/${id}` : `${API_BASE_URL}/admin/poi/add`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert(id ? '修改成功' : '添加成功');
          closePoiModal();
          loadPoi();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('操作失败', 'error');
      }
    });

    // 充电桩表单提交
    document.getElementById('chargingForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const id = data.id;
      delete data.id;

      try {
        const url = id ? `${API_BASE_URL}/admin/charging/update/${id}` : `${API_BASE_URL}/admin/charging/add`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert(id ? '修改成功' : '添加成功');
          closeChargingModal();
          loadCharging();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('操作失败', 'error');
      }
    });

    // 校巴表单提交
    document.getElementById('busForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const id = data.id;
      delete data.id;

      try {
        const url = id ? `${API_BASE_URL}/admin/bus/update/${id}` : `${API_BASE_URL}/admin/bus/add`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert(id ? '修改成功' : '添加成功');
          closeBusModal();
          loadBus();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('操作失败', 'error');
      }
    });

    // 赏花点表单提交
    document.getElementById('flowerForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const id = data.id;
      delete data.id;

      // 处理 features 字段（逗号分隔转数组）
      if (data.features) {
        data.features = data.features.split(',').map(f => f.trim()).filter(f => f);
      } else {
        data.features = [];
      }

      // 处理 images 字段（逗号分隔转数组）
      if (data.images) {
        data.images = data.images.split(',').map(img => img.trim()).filter(img => img);
      } else {
        data.images = [];
      }

      // 处理复选框
      data.has_video = document.getElementById('flowerHasVideo').checked ? 1 : 0;
      data.has_360 = document.getElementById('flowerHas360').checked ? 1 : 0;
      data.has_live_stream = document.getElementById('flowerHasLiveStream').checked ? 1 : 0;

      try {
        const url = id ? `${API_BASE_URL}/admin/flower/update/${id}` : `${API_BASE_URL}/admin/flower/add`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert(id ? '修改成功' : '添加成功');
          closeFlowerModal();
          loadFlower();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('操作失败', 'error');
      }
    });

    // 修改密码表单提交
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const oldPassword = document.getElementById('oldPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword !== confirmPassword) {
        showAlert('两次输入的密码不一致', 'error');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ oldPassword, newPassword })
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('密码修改成功，请重新登录');
          setTimeout(() => {
            logout();
          }, 2000);
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('修改失败', 'error');
      }
    });

    // ==================== 新闻管理函数 ====================
    function showAddNewsModal() {
      document.getElementById('newsModalTitle').textContent = '发布动态';
      document.getElementById('newsForm').reset();
      document.getElementById('newsId').value = '';
      document.getElementById('addNewsModal').classList.add('show');
    }

    function closeNewsModal() {
      document.getElementById('addNewsModal').classList.remove('show');
    }

    async function loadNews() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/news/list?pageSize=100`);
        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('newsTableBody');
          tbody.innerHTML = result.data.list.map(news => `
            <tr>
              <td>${news.id}</td>
              <td>${news.title}</td>
              <td>${news.author || '管理员'}</td>
              <td>${news.views || 0}</td>
              <td>${news.likes || 0}</td>
              <td>${new Date(news.created_at).toLocaleString()}</td>
              <td>
                <button class="btn btn-sm btn-primary" onclick="editNews(${news.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteNews(${news.id})">删除</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        showAlert('加载新闻失败', 'error');
      }
    }

    async function editNews(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/news/${id}`);
        const result = await response.json();

        if (result.code === 0) {
          const news = result.data;
          document.getElementById('newsModalTitle').textContent = '编辑动态';
          document.getElementById('newsId').value = news.id;
          document.getElementById('newsTitle').value = news.title;
          document.getElementById('newsContent').value = news.content || '';
          document.getElementById('newsImage').value = news.image || '';
          document.getElementById('newsAuthor').value = news.author || '';
          document.getElementById('addNewsModal').classList.add('show');
        }
      } catch (error) {
        showAlert('获取新闻信息失败', 'error');
      }
    }

    async function deleteNews(id) {
      if (!confirm('确定要删除该动态吗？')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/news/delete/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('删除成功');
          loadNews();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    document.getElementById('newsForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('newsId').value;
      const formData = {
        title: document.getElementById('newsTitle').value,
        content: document.getElementById('newsContent').value,
        image: document.getElementById('newsImage').value,
        author: document.getElementById('newsAuthor').value
      };

      try {
        const url = id
          ? `${API_BASE_URL}/admin/news/update/${id}`
          : `${API_BASE_URL}/admin/news/add`;

        const response = await fetch(url, {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert(id ? '更新成功' : '添加成功');
          closeNewsModal();
          loadNews();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('操作失败', 'error');
      }
    });

    // ==================== 路线管理函数 ====================
    let allFlowerSpots = [];
    let selectedRouteSpots = []; // [{spot_id, order, duration}]

    async function loadFlowerSpotsForSelector() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/flower/spots/simple`);
        const result = await response.json();
        if (result.code === 0) {
          allFlowerSpots = result.data;
          renderSpotSelector();
        }
      } catch (e) { console.error('加载赏花点失败', e); }
    }

    function renderSpotSelector() {
      const container = document.getElementById('routeSpotsSelector');
      if (!allFlowerSpots.length) {
        container.innerHTML = '<p style="color:#999;margin:0;">暂无赏花点数据</p>';
        return;
      }
      container.innerHTML = allFlowerSpots.map(s => {
        const checked = selectedRouteSpots.some(rs => rs.spot_id === s.id);
        const statusLabel = s.status === 'blooming' ? '🌸开花中' : s.status === 'upcoming' ? '⏳待开' : s.status;
        return `<label style="display:flex;align-items:center;gap:8px;padding:6px 4px;cursor:pointer;border-bottom:1px solid #f0f0f0;">
          <input type="checkbox" value="${s.id}" ${checked ? 'checked' : ''} onchange="toggleRouteSpot(${s.id}, '${s.name.replace(/'/g, "\\'")}')">
          <span style="font-weight:500;">${s.name}</span>
          <span style="color:#999;font-size:12px;">${s.type} · ${statusLabel}</span>
        </label>`;
      }).join('');
    }

    function toggleRouteSpot(spotId, spotName) {
      const idx = selectedRouteSpots.findIndex(s => s.spot_id === spotId);
      if (idx >= 0) {
        selectedRouteSpots.splice(idx, 1);
      } else {
        selectedRouteSpots.push({ spot_id: spotId, order: selectedRouteSpots.length + 1, duration: '', name: spotName });
      }
      reorderSpots();
      renderSpotsOrder();
    }

    function reorderSpots() {
      selectedRouteSpots.forEach((s, i) => { s.order = i + 1; });
    }

    function moveSpot(spotId, direction) {
      const idx = selectedRouteSpots.findIndex(s => s.spot_id === spotId);
      if (idx < 0) return;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= selectedRouteSpots.length) return;
      [selectedRouteSpots[idx], selectedRouteSpots[newIdx]] = [selectedRouteSpots[newIdx], selectedRouteSpots[idx]];
      reorderSpots();
      renderSpotsOrder();
    }

    function updateSpotDuration(spotId, value) {
      const spot = selectedRouteSpots.find(s => s.spot_id === spotId);
      if (spot) spot.duration = value;
    }

    function renderSpotsOrder() {
      const container = document.getElementById('routeSpotsOrder');
      if (!selectedRouteSpots.length) {
        container.innerHTML = '<p style="color:#ccc;font-size:13px;">未选择任何赏花点</p>';
        return;
      }
      container.innerHTML = selectedRouteSpots.map((s, i) => {
        const spotInfo = allFlowerSpots.find(fs => fs.id === s.spot_id);
        const name = spotInfo ? spotInfo.name : (s.name || `#${s.spot_id}`);
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#f8f9fa;border-radius:6px;">
          <span style="background:#ff9a9e;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">${s.order}</span>
          <span style="flex:1;font-size:13px;font-weight:500;">${name}</span>
          <input type="text" value="${s.duration || ''}" placeholder="游览时长" style="width:80px;padding:3px 6px;font-size:12px;border:1px solid #ddd;border-radius:4px;" onchange="updateSpotDuration(${s.spot_id}, this.value)">
          <button type="button" onclick="moveSpot(${s.spot_id},-1)" style="padding:2px 6px;font-size:12px;cursor:pointer;" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" onclick="moveSpot(${s.spot_id},1)" style="padding:2px 6px;font-size:12px;cursor:pointer;" ${i === selectedRouteSpots.length - 1 ? 'disabled' : ''}>↓</button>
        </div>`;
      }).join('');
    }

    function showAddRouteModal() {
      document.getElementById('routeModalTitle').textContent = '添加赏花路线';
      document.getElementById('routeForm').reset();
      document.getElementById('routeId').value = '';
      selectedRouteSpots = [];
      loadFlowerSpotsForSelector().then(() => { renderSpotsOrder(); });
      document.getElementById('addRouteModal').classList.add('show');
    }

    function closeRouteModal() {
      document.getElementById('addRouteModal').classList.remove('show');
    }

    async function loadRoutes() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/flower/routes/list?pageSize=100`);
        const result = await response.json();

        if (result.code === 0) {
          const tbody = document.getElementById('routesTableBody');
          tbody.innerHTML = result.data.list.map(route => `
            <tr>
              <td>${route.id}</td>
              <td>${route.name}</td>
              <td>${route.duration || '-'}</td>
              <td>${route.distance ? route.distance + 'm' : '-'}</td>
              <td>${route.difficulty || '简单'}</td>
              <td>${route.best_time || '-'}</td>
              <td>
                <button class="btn btn-sm btn-primary" onclick="editRoute(${route.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRoute(${route.id})">删除</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (error) {
        showAlert('加载路线失败', 'error');
      }
    }

    async function editRoute(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/flower/routes/${id}`);
        const result = await response.json();

        if (result.code === 0) {
          const route = result.data;
          document.getElementById('routeModalTitle').textContent = '编辑赏花路线';
          document.getElementById('routeId').value = route.id;
          document.getElementById('routeName').value = route.name;
          document.getElementById('routeDuration').value = route.duration || '';
          document.getElementById('routeDistance').value = route.distance || '';
          document.getElementById('routeDifficulty').value = route.difficulty || '简单';

          // spots 已由后端 enrichRouteSpots 解析为 [{spot_id, order, duration, name, ...}]
          selectedRouteSpots = (route.spots || []).map((s, i) => ({
            spot_id: s.spot_id,
            order: s.order || i + 1,
            duration: s.duration || '',
            name: s.name || ''
          }));

          document.getElementById('routeDescription').value = route.description || '';
          document.getElementById('routeBestTime').value = route.best_time || '';

          const tags = Array.isArray(route.tags) ? route.tags : JSON.parse(route.tags || '[]');
          document.getElementById('routeTags').value = tags.join(',');

          const highlights = Array.isArray(route.highlights) ? route.highlights : JSON.parse(route.highlights || '[]');
          document.getElementById('routeHighlights').value = highlights.join(',');

          const tips = Array.isArray(route.tips) ? route.tips : JSON.parse(route.tips || '[]');
          document.getElementById('routeTips').value = tips.join(',');

          await loadFlowerSpotsForSelector();
          renderSpotsOrder();
          document.getElementById('addRouteModal').classList.add('show');
        }
      } catch (error) {
        showAlert('获取路线信息失败', 'error');
      }
    }

    async function deleteRoute(id) {
      if (!confirm('确定要删除该路线吗？')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/flower/routes/delete/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert('删除成功');
          loadRoutes();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('删除失败', 'error');
      }
    }

    document.getElementById('routeForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('routeId').value;
      const tagsStr = document.getElementById('routeTags').value;
      const highlightsStr = document.getElementById('routeHighlights').value;
      const tipsStr = document.getElementById('routeTips').value;

      const formData = {
        name: document.getElementById('routeName').value,
        duration: document.getElementById('routeDuration').value,
        distance: document.getElementById('routeDistance').value,
        difficulty: document.getElementById('routeDifficulty').value,
        spots: selectedRouteSpots.map(s => ({ spot_id: s.spot_id, order: s.order, duration: s.duration || '' })),
        description: document.getElementById('routeDescription').value,
        best_time: document.getElementById('routeBestTime').value,
        tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [],
        highlights: highlightsStr ? highlightsStr.split(',').map(h => h.trim()).filter(h => h) : [],
        tips: tipsStr ? tipsStr.split(',').map(t => t.trim()).filter(t => t) : []
      };

      try {
        const url = id
          ? `${API_BASE_URL}/admin/flower/routes/update/${id}`
          : `${API_BASE_URL}/admin/flower/routes/add`;

        const response = await fetch(url, {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.code === 0) {
          showAlert(id ? '更新成功' : '添加成功');
          closeRouteModal();
          loadRoutes();
        } else {
          showAlert(result.message, 'error');
        }
      } catch (error) {
        showAlert('操作失败', 'error');
      }
    });

    // 页面加载时检查登录状态
    window.addEventListener('load', checkAuth);
