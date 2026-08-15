const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'doc');

// Parameter syntax: location:name[!][=default]. "!" means required.
const groups = [
  ['用户认证', '/api/auth', [
    ['POST', '/register', '用户注册', 'body:phone!, body:password!', '', '手机号须为中国大陆手机号；密码至少 6 位'],
    ['POST', '/login', '用户登录', 'body:phone!, body:password!', '', '成功后返回有效期 7 天的 JWT'],
    ['GET', '/userinfo', '获取当前用户信息', '', 'user', 'Authorization 头直接传 token，不加 Bearer 前缀'],
  ]],
  ['POI', '/api/poi', [
    ['GET', '/list', 'POI 分页列表', 'query:type, query:keyword, query:latitude, query:longitude, query:radius=5000, query:page=1, query:pageSize=10'],
    ['GET', '/search', '搜索 POI', 'query:keyword!, query:type, query:minRating, query:latitude, query:longitude, query:radius, query:limit=20'],
    ['GET', '/search/hot', '热门搜索'],
    ['GET', '/search/suggest', '搜索联想', 'query:keyword!'],
    ['GET', '/detail/:id', 'POI 详情', 'path:id!, query:userId', '', 'userId 用于返回收藏状态'],
  ]],
  ['GIS', '/api/gis', [
    ['POST', '/buffer-analysis', '缓冲区分析', 'body:latitude!, body:longitude!, body:radius!, body:type'],
    ['GET', '/nearby-search', '周边搜索', 'query:latitude!, query:longitude!, query:radius=1000, query:types, query:keyword'],
    ['GET', '/heatmap', '热力图数据', 'query:type=poi'],
    ['GET', '/nearest-facility', '最近设施', 'query:latitude!, query:longitude!, query:facilityType!, query:limit=5'],
  ]],
  ['地图代理', '/api/map', [
    ['POST', '/direction', '腾讯地图路线规划代理', 'body:mode=walking, body:from!, body:to!, body:policy', '', '第三方 Key 仅由后端 TENCENT_MAP_KEY 注入'],
    ['GET', '/search', '地点搜索代理', 'query:keyword!, query:latitude, query:longitude, query:radius=1000, query:region, query:page=1, query:pageSize=10'],
    ['GET', '/reverse-geocoder', '逆地理编码代理', 'query:latitude!, query:longitude!, query:getPoi'],
    ['GET', '/suggestion', '地点输入联想代理', 'query:keyword!, query:region, query:page=1, query:pageSize=10'],
    ['GET', '/geocoder', '地址编码代理', 'query:address!, query:region'],
    ['GET', '/distance', '路线距离计算代理', 'query:mode=walking, query:from!, query:to!'],
  ]],
  ['路线', '/api/route', [
    ['POST', '/plan', '路线规划', 'body:from!, body:to!, body:mode=walking, body:alternatives=true', '', 'from/to 为含 name、latitude、longitude 的对象'],
    ['POST', '/bus', '校巴路线规划', 'body:from!, body:to!'],
    ['POST', '/save', '保存常用路线', 'body:userId!, body:name, body:from!, body:to!, body:mode=walking, body:duration, body:distance'],
    ['GET', '/my-routes', '常用路线列表', 'query:userId!'],
    ['DELETE', '/delete', '删除常用路线', 'body:routeId!, body:userId!'],
  ]],
  ['收藏', '/api/favorites', [
    ['POST', '/add', '添加收藏', 'body:userId!, body:poiId!'],
    ['POST', '/remove', '取消收藏', 'body:userId!, body:poiId!'],
    ['GET', '/list', '收藏列表', 'query:userId!'],
    ['GET', '/check', '检查收藏状态', 'query:userId!, query:poiId!'],
  ]],
  ['校巴', '/api/bus', [
    ['GET', '/lines', '校巴线路列表'],
    ['GET', '/line/:id', '线路详情与站点', 'path:id!'],
    ['GET', '/line/:id/route', '线路地图轨迹', 'path:id!', '', '依赖腾讯地图 Key，结果会写入缓存'],
    ['GET', '/realtime/:lineId', '车辆实时位置（模拟）', 'path:lineId!'],
    ['GET', '/arrival', '预计到站时间（模拟）', 'query:lineId!, query:stopId!'],
    ['POST', '/subscribe', '订阅到站提醒', 'body:lineId!, body:stopId!, body:userId!'],
    ['DELETE', '/subscribe/:id', '取消到站订阅', 'path:id!'],
  ]],
  ['充电', '/api/charging', [
    ['GET', '/stations', '充电桩列表', 'query:latitude, query:longitude, query:status'],
    ['POST', '/reserve', '预约充电桩', 'body:stationId!, body:startTime!, body:duration=60, body:phone, body:userId', '', 'userId 也可由 userid 请求头传入；未传时当前实现默认为 1'],
    ['GET', '/station/:id', '充电桩详情', 'path:id!'],
    ['POST', '/cancel/:id', '取消预约', 'path:id!'],
    ['GET', '/records', '用户充电记录', 'query:userId!, query:status'],
    ['GET', '/reservation', '用户当前预约', 'query:userId!, query:stationId'],
    ['GET', '/reservations', '用户全部预约', 'query:userId!'],
    ['POST', '/suggestion', '提交充电桩规划建议', 'body:userId!, body:location, body:locationName, body:latitude, body:longitude, body:reason!', '', 'locationName 与 location 至少传一个'],
    ['GET', '/suggestions', '用户规划建议列表', 'query:userId!'],
    ['POST', '/start', '开始充电', 'body:userId!, body:stationId!, body:reservationId'],
    ['POST', '/stop', '结束充电', 'body:userId!, body:stationId!, body:recordId!'],
    ['POST', '/cancel-charging', '取消进行中的充电', 'body:userId!, body:stationId!, body:recordId!'],
    ['GET', '/stats', '充电统计'],
  ]],
  ['停车场', '/api/parking', [
    ['GET', '/list', '停车场列表', 'query:type', '', 'type: bike / ebike / car'],
    ['GET', '/detail/:id', '停车场详情', 'path:id!'],
  ]],
  ['赏花', '/api/flower', [
    ['GET', '/spots', '赏花点列表', 'query:category, query:latitude, query:longitude, query:radius, query:status'],
    ['GET', '/spot/:id', '赏花点详情', 'path:id!'],
    ['GET', '/routes', '赏花路线列表'],
    ['POST', '/checkin', '赏花打卡', 'body:userId!, body:spotId!, body:images, body:comment, body:rating=5'],
    ['POST', '/upload-checkin', '上传打卡图片', 'form:image!, query:userId, query:spotId', '', 'multipart/form-data'],
    ['GET', '/user-checkin-status', '用户打卡状态', 'query:userId!, query:spotId!'],
    ['GET', '/checkins/:spotId', '赏花点打卡列表', 'path:spotId!'],
    ['GET', '/routes/:id', '赏花路线详情', 'path:id!'],
  ]],
  ['校园资讯', '/api/news', [
    ['GET', '/:id', '资讯详情', 'path:id!', '', '当前代码中该路由先于 /list 注册，GET /api/news/list 会被误当作详情请求'],
    ['GET', '/list', '资讯分页列表', 'query:page=1, query:pageSize=10', '', '受路由顺序问题影响，当前可能无法访问'],
  ]],
  ['管理员账号', '/api/admin', [
    ['POST', '/login', '管理员登录', 'body:username!, body:password!'],
    ['GET', '/info', '管理员信息', '', 'admin'],
    ['POST', '/change-password', '修改管理员密码', 'body:oldPassword!, body:newPassword!', 'admin'],
    ['GET', '/list', '管理员列表', '', 'super'],
    ['POST', '/add', '新增管理员', 'body:username!, body:password!, body:name, body:email, body:phone, body:role', 'super'],
    ['PUT', '/update/:id', '更新管理员', 'path:id!, body:name, body:email, body:phone, body:role, body:status', 'super'],
    ['POST', '/reset-password/:id', '重置管理员密码', 'path:id!, body:newPassword!', 'super'],
    ['DELETE', '/delete/:id', '删除管理员', 'path:id!', 'super'],
    ['GET', '/stats', '后台统计数据', '', 'admin'],
  ]],
  ['后台业务管理', '/api/admin', [
    ['GET', '/users', '用户列表'],
    ['GET', '/favorites/stats', '收藏统计'],
    ['DELETE', '/users/delete/:id', '删除用户', 'path:id!'],
    ['POST', '/poi/add', '新增 POI', 'body:name!, body:type, body:latitude!, body:longitude!, body:description, body:comment, body:rating, body:open_time, body:hot'],
    ['PUT', '/poi/update/:id', '更新 POI', 'path:id!, body:name, body:type, body:latitude, body:longitude, body:description, body:comment, body:rating, body:open_time'],
    ['DELETE', '/poi/delete/:id', '删除 POI', 'path:id!'],
    ['POST', '/charging/add', '新增充电桩', 'body:name!, body:location, body:latitude, body:longitude, body:status, body:power, body:total_slots, body:available_slots, body:price'],
    ['PUT', '/charging/update/:id', '更新充电桩', 'path:id!, body:name, body:location, body:latitude, body:longitude, body:status, body:power, body:total_slots, body:available_slots, body:price'],
    ['DELETE', '/charging/delete/:id', '删除充电桩', 'path:id!'],
    ['POST', '/bus/add', '新增校巴线路', 'body:number!, body:name, body:start_station, body:end_station, body:operating_time, body:interval_minutes'],
    ['PUT', '/bus/update/:id', '更新校巴线路', 'path:id!, body:number, body:name, body:start_station, body:end_station, body:operating_time, body:interval_minutes'],
    ['DELETE', '/bus/delete/:id', '删除校巴线路', 'path:id!'],
    ['GET', '/bus/stops', '校巴站点列表'],
    ['POST', '/bus/stops/add', '新增校巴站点', 'body:name!, body:latitude!, body:longitude!'],
    ['PUT', '/bus/stops/update/:id', '更新校巴站点', 'path:id!, body:name, body:latitude, body:longitude'],
    ['DELETE', '/bus/stops/delete/:id', '删除校巴站点', 'path:id!'],
    ['POST', '/bus/line/:id/stops', '全量保存线路站点', 'path:id!, body:stops!', '', 'stops: [{ stop_id, sequence }]'],
    ['GET', '/bus/line/:id/stops', '线路站点列表', 'path:id!'],
    ['POST', '/flower/upload', '上传赏花图片', 'form:image!', '', 'multipart/form-data'],
    ['DELETE', '/flower/image/:filename', '删除赏花图片', 'path:filename!'],
    ['GET', '/flower/list', '管理端赏花点列表', 'query:page=1, query:pageSize=10, query:type, query:status, query:keyword'],
    ['POST', '/flower/add', '新增赏花点', 'body:name!, body:type, body:latitude, body:longitude, body:description, body:best_time, body:features, body:rating, body:status, body:images, body:has_video, body:has_360, body:has_live_stream'],
    ['PUT', '/flower/update/:id', '更新赏花点', 'path:id!, body:name, body:type, body:latitude, body:longitude, body:description, body:best_time, body:features, body:rating, body:status, body:images, body:has_video, body:has_360, body:has_live_stream, body:checkin_count'],
    ['DELETE', '/flower/delete/:id', '删除赏花点', 'path:id!'],
    ['GET', '/news/list', '管理端资讯列表', 'query:page=1, query:pageSize=10, query:keyword'],
    ['POST', '/news/add', '新增资讯', 'body:title!, body:content!, body:image, body:author'],
    ['PUT', '/news/update/:id', '更新资讯', 'path:id!, body:title, body:content, body:image, body:author'],
    ['DELETE', '/news/delete/:id', '删除资讯', 'path:id!'],
    ['GET', '/flower/routes/list', '管理端赏花路线列表', 'query:page=1, query:pageSize=10, query:keyword'],
    ['POST', '/flower/routes/add', '新增赏花路线', 'body:name!, body:duration, body:distance, body:difficulty, body:spots, body:description, body:best_time, body:tags, body:highlights, body:tips'],
    ['PUT', '/flower/routes/update/:id', '更新赏花路线', 'path:id!, body:name, body:duration, body:distance, body:difficulty, body:spots, body:description, body:best_time, body:tags, body:highlights, body:tips'],
    ['DELETE', '/flower/routes/delete/:id', '删除赏花路线', 'path:id!'],
    ['GET', '/flower/spots/simple', '赏花点简表'],
    ['GET', '/flower/checkins', '打卡记录列表', 'query:page=1, query:pageSize=20, query:spotId'],
  ]],
];

function parseParam(token) {
  const [location, raw = ''] = token.trim().split(':');
  const [withRequired, defaultValue] = raw.split('=');
  const required = withRequired.endsWith('!');
  const name = required ? withRequired.slice(0, -1) : withRequired;
  return { location, name, required, defaultValue };
}

function scalarSchema(name, defaultValue) {
  const numeric = /(^id$|Id$|_id$|latitude|longitude|radius|rating|distance|duration|limit|page|pageSize|status|power|slots|price|count|sequence)/i.test(name);
  const boolean = /^(alternatives|hot|has_)/i.test(name);
  const array = /^(images|features|spots|tags|highlights|tips|stops|types)$/i.test(name);
  const object = /^(from|to)$/i.test(name);
  const schema = array ? { type: 'array', items: { type: 'object', additionalProperties: true } }
    : object ? { type: 'object', additionalProperties: true }
      : boolean ? { type: 'boolean' }
        : numeric ? { type: 'number' }
          : { type: 'string' };
  if (defaultValue !== undefined) {
    schema.default = schema.type === 'number' ? Number(defaultValue)
      : schema.type === 'boolean' ? defaultValue === 'true'
        : defaultValue;
  }
  return schema;
}

const openapi = {
  openapi: '3.0.3',
  info: {
    title: '华农掌中行 API',
    version: '1.0.0',
    description: '由 back/server.js 与 back/routes/*.js 导出的接口定义（2026-08-14）。',
  },
  servers: [{ url: 'http://localhost:3000', description: '本地后端（以 PORT 环境变量为准）' }],
  tags: groups.map(([name]) => ({ name })),
  paths: {},
  components: {
    securitySchemes: {
      userToken: { type: 'apiKey', in: 'header', name: 'Authorization', description: '用户 JWT，直接传 token' },
      adminBearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: '管理员 JWT' },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: { code: { type: 'integer', example: 0 }, message: { type: 'string' }, data: { nullable: true } },
        required: ['code'],
      },
    },
  },
};

let count = 0;
const md = [
  '# 华农掌中行 API 接口文档',
  '',
  '> 导出时间：2026-08-14  ',
  '> 接口来源：`back/server.js`、`back/routes/*.js`  ',
  '> OpenAPI 文件：`doc/openapi.json`',
  '',
  '## 通用约定',
  '',
  '- 默认服务地址：`http://localhost:3000`，实际端口以 `back/.env` 的 `PORT` 为准。',
  '- API 前缀：`/api`；请求和响应默认使用 `application/json`。',
  '- 通用成功响应：`{ "code": 0, "message": "success", "data": ... }`。',
  '- 通用失败响应：`{ "code": -1, "message": "错误说明" }`，常见 HTTP 状态为 400、401、403、404、500。',
  '- 用户认证：`Authorization: <token>`；管理员认证：`Authorization: Bearer <token>`。',
  '- 表格中带 `*` 的参数为必填；`字段=值` 表示默认值。',
  '',
  '## 快速示例',
  '',
  '```bash',
  'curl -X POST http://localhost:3000/api/auth/login \\',
  '  -H "Content-Type: application/json" \\',
  '  -d \'{"phone":"13800138000","password":"123456"}\'',
  '```',
  '',
  '## 接口目录',
  '',
];

for (const [tag, base, endpoints] of groups) {
  md.push(`### ${tag}`, '', '| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |', '| --- | --- | --- | --- | --- |');
  for (const [method, route, summary, rawParams = '', auth = '', note = ''] of endpoints) {
    count += 1;
    const params = rawParams ? rawParams.split(',').map(parseParam) : [];
    const fullPath = `${base}${route}`;
    const displayPath = fullPath.replace(/:([A-Za-z_][\w]*)/g, '{$1}');
    const paramText = params.map(p => `${p.location}.${p.name}${p.required ? '*' : ''}${p.defaultValue !== undefined ? `=${p.defaultValue}` : ''}`).join('<br>') || '—';
    const authText = auth === 'super' ? '超级管理员 JWT' : auth === 'admin' ? '管理员 JWT' : auth === 'user' ? '用户 JWT' : '公开（代码未鉴权）';
    md.push(`| ${method} | \`${fullPath}\` | ${summary} | ${paramText} | ${authText}${note ? `<br>${note}` : ''} |`);

    const operation = {
      tags: [tag],
      summary,
      description: note || undefined,
      operationId: `${method.toLowerCase()}_${displayPath.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')}`,
      responses: {
        200: { description: '成功', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        400: { description: '请求参数或业务状态错误' },
        401: { description: '未认证或 token 无效' },
        403: { description: '权限不足' },
        404: { description: '资源不存在' },
        500: { description: '服务器错误' },
      },
    };
    if (auth === 'user') operation.security = [{ userToken: [] }];
    if (auth === 'admin' || auth === 'super') operation.security = [{ adminBearer: [] }];

    const normalParams = params.filter(p => p.location === 'path' || p.location === 'query');
    if (normalParams.length) {
      operation.parameters = normalParams.map(p => ({
        name: p.name,
        in: p.location,
        required: p.location === 'path' || p.required,
        schema: scalarSchema(p.name, p.defaultValue),
      }));
    }
    const bodyParams = params.filter(p => p.location === 'body');
    const formParams = params.filter(p => p.location === 'form');
    if (bodyParams.length) {
      const properties = {};
      for (const p of bodyParams) properties[p.name] = scalarSchema(p.name, p.defaultValue);
      const required = bodyParams.filter(p => p.required).map(p => p.name);
      operation.requestBody = {
        required: required.length > 0,
        content: { 'application/json': { schema: { type: 'object', properties, ...(required.length ? { required } : {}) } } },
      };
    } else if (formParams.length) {
      const properties = {};
      for (const p of formParams) properties[p.name] = { type: 'string', format: 'binary' };
      operation.requestBody = {
        required: true,
        content: { 'multipart/form-data': { schema: { type: 'object', properties, required: formParams.filter(p => p.required).map(p => p.name) } } },
      };
    }
    if (!openapi.paths[displayPath]) openapi.paths[displayPath] = {};
    openapi.paths[displayPath][method.toLowerCase()] = operation;
  }
  md.push('');
}

md.splice(13, 0, `- 当前共导出 **${count}** 个 HTTP 接口。`);
md.push(
  '## 实现注意事项',
  '',
  '1. `GET /api/news/:id` 在 `GET /api/news/list` 前注册，Express 会把 `list` 当作 `id`；应调整路由顺序后再联调资讯列表。',
  '2. `back/routes/admin-manage.js` 的业务管理接口当前没有挂载 `adminAuth`，因此文档按实际实现标为“公开（代码未鉴权）”；生产部署前应补齐鉴权。',
  '3. 除用户信息和部分管理员接口外，多数业务接口直接信任客户端传入的 `userId`，并未从 JWT 推导用户身份。',
  '4. `POST /api/charging/reserve` 未传 userId 时会回退为用户 1；这是当前实现行为，不建议用于生产环境。',
  '5. 校巴实时位置与预计到站时间当前为模拟数据。',
  '',
  '## 状态值摘要',
  '',
  '- 充电桩 `status`：`0` 空闲、`1` 充电中、`2` 已预约、`3` 故障。',
  '- 充电预约状态依当前代码使用：`1` 有效、`2` 已完成、`3` 已取消。',
  '- 管理员 `role`：普通管理员与 `super`（超级管理员）；`status=1` 表示可登录。',
  '- 停车场 `type`：`bike`、`ebike`、`car`。',
  '',
  '## 静态资源与 WebSocket',
  '',
  '- 图片：`GET /images/*`，映射到 `back/images/`。',
  '- WebSocket：`ws://localhost:3001`，实际端口以 `WS_PORT` 为准，用于广播充电桩状态。',
  ''
);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'API.md'), md.join('\n'), 'utf8');
fs.writeFileSync(path.join(outDir, 'openapi.json'), `${JSON.stringify(openapi, null, 2)}\n`, 'utf8');
console.log(`Exported ${count} endpoints to doc/API.md and doc/openapi.json`);
