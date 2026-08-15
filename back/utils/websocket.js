// utils/websocket.js - WebSocket 服务

const WebSocket = require('ws');

const clients = new Map(); // 存储客户端连接
let wssInstance = null;

/**
 * 初始化 WebSocket 服务
 * @param {number} WS_PORT WebSocket 端口
 * @returns {{ wss: WebSocket.Server, clients: Map, broadcastChargingStatus: Function }}
 */
function initWebSocket(WS_PORT) {
  const wss = new WebSocket.Server({ port: WS_PORT });
  wssInstance = wss;

  wss.on('connection', (ws) => {
    const clientId = Date.now();
    clients.set(clientId, ws);

    console.log(`客户端 ${clientId} 已连接`);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'subscribe') {
          // 订阅频道
          ws.channel = data.channel;
          console.log(`客户端 ${clientId} 订阅频道: ${data.channel}`);
        }
      } catch (error) {
        console.error('处理消息失败:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`客户端 ${clientId} 已断开`);
    });
  });

  return { wss, clients, broadcastChargingStatus };
}

/**
 * 广播充电桩状态更新
 */
function broadcastChargingStatus(stationId, status) {
  const message = JSON.stringify({
    type: 'charging-status-update',
    stationId,
    status
  });

  clients.forEach((client) => {
    if (client.channel === 'charging-status' && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { initWebSocket, broadcastChargingStatus, clients };
