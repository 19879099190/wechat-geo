// tasks/scheduled.js - 定时任务

/**
 * 检查并取消过期的预约
 * 预约规则：预约时间后30分钟内有效，超时自动取消
 */
async function checkExpiredReservations(pool, broadcastChargingStatus) {
  try {
    console.log('🔍 检查过期预约...');

    // 查找所有进行中的预约（status = 1）
    const [reservations] = await pool.execute(
      `SELECT id, station_id, start_time, created_at
       FROM charging_reservation
       WHERE status = 1`
    );

    if (reservations.length === 0) {
      console.log('✓ 没有进行中的预约');
      return;
    }

    console.log(`找到 ${reservations.length} 个进行中的预约`);

    const now = new Date();
    let expiredCount = 0;

    for (const reservation of reservations) {
      const startTime = new Date(reservation.start_time);
      const expiryTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 预约时间后30分钟

      // 如果当前时间超过过期时间
      if (now > expiryTime) {
        // console.log(`⏰ 预约 #${reservation.id} 已过期 (预约时间: ${startTime.toLocaleString()}, 过期时间: ${expiryTime.toLocaleString()})`);

        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();

          // 更新预约状态为已过期（status = 4）
          await connection.execute(
            'UPDATE charging_reservation SET status = 4, updated_at = NOW() WHERE id = ?',
            [reservation.id]
          );

          // 更新充电桩状态为空闲
          await connection.execute(
            'UPDATE charging_station SET status = 0, updated_at = NOW() WHERE id = ?',
            [reservation.station_id]
          );

          await connection.commit();

          console.log(`✓ 预约 #${reservation.id} 已自动取消，充电桩 #${reservation.station_id} 恢复空闲`);

          // 通过WebSocket通知状态更新
          broadcastChargingStatus(reservation.station_id, 0);

          expiredCount++;
        } catch (error) {
          await connection.rollback();
          console.error(`❌ 取消预约 #${reservation.id} 失败:`, error.message);
        } finally {
          connection.release();
        }
      }
    }

    if (expiredCount > 0) {
      console.log(`✓ 已自动取消 ${expiredCount} 个过期预约`);
    } else {
      console.log('✓ 没有过期的预约');
    }
  } catch (error) {
    console.error('❌ 检查过期预约失败:', error);
  }
}

/**
 * 检查长时间充电的记录（超过4小时自动结束）
 */
async function checkLongChargingSessions(pool, broadcastChargingStatus) {
  try {
    console.log('🔍 检查长时间充电记录...');

    // 查找所有未结束的充电记录
    const [records] = await pool.execute(
      `SELECT cr.id, cr.user_id, cr.station_id, cr.start_time, cs.power, cs.price
       FROM charging_record cr
       JOIN charging_station cs ON cr.station_id = cs.id
       WHERE cr.end_time IS NULL`
    );

    if (records.length === 0) {
      console.log('✓ 没有进行中的充电');
      return;
    }

    console.log(`找到 ${records.length} 个进行中的充电`);

    const now = new Date();
    let autoEndCount = 0;

    for (const record of records) {
      const startTime = new Date(record.start_time);
      const durationMs = now - startTime;
      const durationHours = durationMs / (1000 * 60 * 60);

      // 如果充电时间超过4小时，自动结束
      if (durationHours > 4) {
        console.log(`⚠️ 充电记录 #${record.id} 已超过4小时 (开始时间: ${startTime.toLocaleString()})`);

        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();

          // 计算充电数据
          const durationMinutes = Math.floor(durationMs / 60000);
          let durationText;
          if (durationMinutes < 60) {
            durationText = `${durationMinutes}分钟`;
          } else {
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            durationText = `${hours}小时${minutes}分钟`;
          }

          const energy = (record.power / 1000) * durationHours;
          const cost = energy * (record.price || 1.5);

          // 更新充电记录
          await connection.execute(
            `UPDATE charging_record
             SET end_time = NOW(), duration = ?, energy = ?, cost = ?, updated_at = NOW()
             WHERE id = ?`,
            [durationText, energy.toFixed(2), cost.toFixed(2), record.id]
          );

          // 更新充电桩状态为空闲
          await connection.execute(
            'UPDATE charging_station SET status = 0, updated_at = NOW() WHERE id = ?',
            [record.station_id]
          );

          await connection.commit();

          console.log(`✓ 充电记录 #${record.id} 已自动结束 (时长: ${durationText}, 费用: ¥${cost.toFixed(2)})`);

          // 通过WebSocket通知状态更新
          broadcastChargingStatus(record.station_id, 0);

          autoEndCount++;
        } catch (error) {
          await connection.rollback();
          console.error(`❌ 自动结束充电 #${record.id} 失败:`, error.message);
        } finally {
          connection.release();
        }
      }
    }

    if (autoEndCount > 0) {
      console.log(`✓ 已自动结束 ${autoEndCount} 个长时间充电`);
    } else {
      console.log('✓ 没有需要自动结束的充电');
    }
  } catch (error) {
    console.error('❌ 检查长时间充电失败:', error);
  }
}

// 启动定时任务
function startScheduledTasks(pool, broadcastChargingStatus) {
  // 每分钟检查一次过期预约
  setInterval(() => checkExpiredReservations(pool, broadcastChargingStatus), 60 * 1000);
  console.log('✓ 过期预约检查任务已启动 (每分钟执行一次)');

  // 每5分钟检查一次长时间充电
  setInterval(() => checkLongChargingSessions(pool, broadcastChargingStatus), 5 * 60 * 1000);
  console.log('✓ 长时间充电检查任务已启动 (每5分钟执行一次)');

  // 立即执行一次
  setTimeout(() => {
    checkExpiredReservations(pool, broadcastChargingStatus);
    checkLongChargingSessions(pool, broadcastChargingStatus);
  }, 5000); // 启动5秒后执行
}

module.exports = { startScheduledTasks };
