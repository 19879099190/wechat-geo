# 华农掌中行 API 接口文档

> 导出时间：2026-08-14  
> 接口来源：`back/server.js`、`back/routes/*.js`  
> OpenAPI 文件：`doc/openapi.json`

## 通用约定

- 默认服务地址：`http://localhost:3000`，实际端口以 `back/.env` 的 `PORT` 为准。
- API 前缀：`/api`；请求和响应默认使用 `application/json`。
- 通用成功响应：`{ "code": 0, "message": "success", "data": ... }`。
- 通用失败响应：`{ "code": -1, "message": "错误说明" }`，常见 HTTP 状态为 400、401、403、404、500。
- 用户认证：`Authorization: <token>`；管理员认证：`Authorization: Bearer <token>`。
- 当前共导出 **102** 个 HTTP 接口。
- 表格中带 `*` 的参数为必填；`字段=值` 表示默认值。

## 快速示例

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'
```

## 接口目录

### 用户认证

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | 用户注册 | body.phone*<br>body.password* | 公开（代码未鉴权）<br>手机号须为中国大陆手机号；密码至少 6 位 |
| POST | `/api/auth/login` | 用户登录 | body.phone*<br>body.password* | 公开（代码未鉴权）<br>成功后返回有效期 7 天的 JWT |
| GET | `/api/auth/userinfo` | 获取当前用户信息 | — | 用户 JWT<br>Authorization 头直接传 token，不加 Bearer 前缀 |

### POI

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| GET | `/api/poi/list` | POI 分页列表 | query.type<br>query.keyword<br>query.latitude<br>query.longitude<br>query.radius=5000<br>query.page=1<br>query.pageSize=10 | 公开（代码未鉴权） |
| GET | `/api/poi/search` | 搜索 POI | query.keyword*<br>query.type<br>query.minRating<br>query.latitude<br>query.longitude<br>query.radius<br>query.limit=20 | 公开（代码未鉴权） |
| GET | `/api/poi/search/hot` | 热门搜索 | — | 公开（代码未鉴权） |
| GET | `/api/poi/search/suggest` | 搜索联想 | query.keyword* | 公开（代码未鉴权） |
| GET | `/api/poi/detail/:id` | POI 详情 | path.id*<br>query.userId | 公开（代码未鉴权）<br>userId 用于返回收藏状态 |

### GIS

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| POST | `/api/gis/buffer-analysis` | 缓冲区分析 | body.latitude*<br>body.longitude*<br>body.radius*<br>body.type | 公开（代码未鉴权） |
| GET | `/api/gis/nearby-search` | 周边搜索 | query.latitude*<br>query.longitude*<br>query.radius=1000<br>query.types<br>query.keyword | 公开（代码未鉴权） |
| GET | `/api/gis/heatmap` | 热力图数据 | query.type=poi | 公开（代码未鉴权） |
| GET | `/api/gis/nearest-facility` | 最近设施 | query.latitude*<br>query.longitude*<br>query.facilityType*<br>query.limit=5 | 公开（代码未鉴权） |

### 地图代理

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| POST | `/api/map/direction` | 腾讯地图路线规划代理 | body.mode=walking<br>body.from*<br>body.to*<br>body.policy | 公开（代码未鉴权）<br>第三方 Key 仅由后端 TENCENT_MAP_KEY 注入 |
| GET | `/api/map/search` | 地点搜索代理 | query.keyword*<br>query.latitude<br>query.longitude<br>query.radius=1000<br>query.region<br>query.page=1<br>query.pageSize=10 | 公开（代码未鉴权） |
| GET | `/api/map/reverse-geocoder` | 逆地理编码代理 | query.latitude*<br>query.longitude*<br>query.getPoi | 公开（代码未鉴权） |
| GET | `/api/map/suggestion` | 地点输入联想代理 | query.keyword*<br>query.region<br>query.page=1<br>query.pageSize=10 | 公开（代码未鉴权） |
| GET | `/api/map/geocoder` | 地址编码代理 | query.address*<br>query.region | 公开（代码未鉴权） |
| GET | `/api/map/distance` | 路线距离计算代理 | query.mode=walking<br>query.from*<br>query.to* | 公开（代码未鉴权） |

### 路线

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| POST | `/api/route/plan` | 路线规划 | body.from*<br>body.to*<br>body.mode=walking<br>body.alternatives=true | 公开（代码未鉴权）<br>from/to 为含 name、latitude、longitude 的对象 |
| POST | `/api/route/bus` | 校巴路线规划 | body.from*<br>body.to* | 公开（代码未鉴权） |
| POST | `/api/route/save` | 保存常用路线 | body.userId*<br>body.name<br>body.from*<br>body.to*<br>body.mode=walking<br>body.duration<br>body.distance | 公开（代码未鉴权） |
| GET | `/api/route/my-routes` | 常用路线列表 | query.userId* | 公开（代码未鉴权） |
| DELETE | `/api/route/delete` | 删除常用路线 | body.routeId*<br>body.userId* | 公开（代码未鉴权） |

### 收藏

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| POST | `/api/favorites/add` | 添加收藏 | body.userId*<br>body.poiId* | 公开（代码未鉴权） |
| POST | `/api/favorites/remove` | 取消收藏 | body.userId*<br>body.poiId* | 公开（代码未鉴权） |
| GET | `/api/favorites/list` | 收藏列表 | query.userId* | 公开（代码未鉴权） |
| GET | `/api/favorites/check` | 检查收藏状态 | query.userId*<br>query.poiId* | 公开（代码未鉴权） |

### 校巴

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| GET | `/api/bus/lines` | 校巴线路列表 | — | 公开（代码未鉴权） |
| GET | `/api/bus/line/:id` | 线路详情与站点 | path.id* | 公开（代码未鉴权） |
| GET | `/api/bus/line/:id/route` | 线路地图轨迹 | path.id* | 公开（代码未鉴权）<br>依赖腾讯地图 Key，结果会写入缓存 |
| GET | `/api/bus/realtime/:lineId` | 车辆实时位置（模拟） | path.lineId* | 公开（代码未鉴权） |
| GET | `/api/bus/arrival` | 预计到站时间（模拟） | query.lineId*<br>query.stopId* | 公开（代码未鉴权） |
| POST | `/api/bus/subscribe` | 订阅到站提醒 | body.lineId*<br>body.stopId*<br>body.userId* | 公开（代码未鉴权） |
| DELETE | `/api/bus/subscribe/:id` | 取消到站订阅 | path.id* | 公开（代码未鉴权） |

### 充电

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| GET | `/api/charging/stations` | 充电桩列表 | query.latitude<br>query.longitude<br>query.status | 公开（代码未鉴权） |
| POST | `/api/charging/reserve` | 预约充电桩 | body.stationId*<br>body.startTime*<br>body.duration=60<br>body.phone<br>body.userId | 公开（代码未鉴权）<br>userId 也可由 userid 请求头传入；未传时当前实现默认为 1 |
| GET | `/api/charging/station/:id` | 充电桩详情 | path.id* | 公开（代码未鉴权） |
| POST | `/api/charging/cancel/:id` | 取消预约 | path.id* | 公开（代码未鉴权） |
| GET | `/api/charging/records` | 用户充电记录 | query.userId*<br>query.status | 公开（代码未鉴权） |
| GET | `/api/charging/reservation` | 用户当前预约 | query.userId*<br>query.stationId | 公开（代码未鉴权） |
| GET | `/api/charging/reservations` | 用户全部预约 | query.userId* | 公开（代码未鉴权） |
| POST | `/api/charging/suggestion` | 提交充电桩规划建议 | body.userId*<br>body.location<br>body.locationName<br>body.latitude<br>body.longitude<br>body.reason* | 公开（代码未鉴权）<br>locationName 与 location 至少传一个 |
| GET | `/api/charging/suggestions` | 用户规划建议列表 | query.userId* | 公开（代码未鉴权） |
| POST | `/api/charging/start` | 开始充电 | body.userId*<br>body.stationId*<br>body.reservationId | 公开（代码未鉴权） |
| POST | `/api/charging/stop` | 结束充电 | body.userId*<br>body.stationId*<br>body.recordId* | 公开（代码未鉴权） |
| POST | `/api/charging/cancel-charging` | 取消进行中的充电 | body.userId*<br>body.stationId*<br>body.recordId* | 公开（代码未鉴权） |
| GET | `/api/charging/stats` | 充电统计 | — | 公开（代码未鉴权） |

### 停车场

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| GET | `/api/parking/list` | 停车场列表 | query.type | 公开（代码未鉴权）<br>type: bike / ebike / car |
| GET | `/api/parking/detail/:id` | 停车场详情 | path.id* | 公开（代码未鉴权） |

### 赏花

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| GET | `/api/flower/spots` | 赏花点列表 | query.category<br>query.latitude<br>query.longitude<br>query.radius<br>query.status | 公开（代码未鉴权） |
| GET | `/api/flower/spot/:id` | 赏花点详情 | path.id* | 公开（代码未鉴权） |
| GET | `/api/flower/routes` | 赏花路线列表 | — | 公开（代码未鉴权） |
| POST | `/api/flower/checkin` | 赏花打卡 | body.userId*<br>body.spotId*<br>body.images<br>body.comment<br>body.rating=5 | 公开（代码未鉴权） |
| POST | `/api/flower/upload-checkin` | 上传打卡图片 | form.image*<br>query.userId<br>query.spotId | 公开（代码未鉴权）<br>multipart/form-data |
| GET | `/api/flower/user-checkin-status` | 用户打卡状态 | query.userId*<br>query.spotId* | 公开（代码未鉴权） |
| GET | `/api/flower/checkins/:spotId` | 赏花点打卡列表 | path.spotId* | 公开（代码未鉴权） |
| GET | `/api/flower/routes/:id` | 赏花路线详情 | path.id* | 公开（代码未鉴权） |

### 校园资讯

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| GET | `/api/news/:id` | 资讯详情 | path.id* | 公开（代码未鉴权）<br>当前代码中该路由先于 /list 注册，GET /api/news/list 会被误当作详情请求 |
| GET | `/api/news/list` | 资讯分页列表 | query.page=1<br>query.pageSize=10 | 公开（代码未鉴权）<br>受路由顺序问题影响，当前可能无法访问 |

### 管理员账号

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| POST | `/api/admin/login` | 管理员登录 | body.username*<br>body.password* | 公开（代码未鉴权） |
| GET | `/api/admin/info` | 管理员信息 | — | 管理员 JWT |
| POST | `/api/admin/change-password` | 修改管理员密码 | body.oldPassword*<br>body.newPassword* | 管理员 JWT |
| GET | `/api/admin/list` | 管理员列表 | — | 超级管理员 JWT |
| POST | `/api/admin/add` | 新增管理员 | body.username*<br>body.password*<br>body.name<br>body.email<br>body.phone<br>body.role | 超级管理员 JWT |
| PUT | `/api/admin/update/:id` | 更新管理员 | path.id*<br>body.name<br>body.email<br>body.phone<br>body.role<br>body.status | 超级管理员 JWT |
| POST | `/api/admin/reset-password/:id` | 重置管理员密码 | path.id*<br>body.newPassword* | 超级管理员 JWT |
| DELETE | `/api/admin/delete/:id` | 删除管理员 | path.id* | 超级管理员 JWT |
| GET | `/api/admin/stats` | 后台统计数据 | — | 管理员 JWT |

### 后台业务管理

| 方法 | 路径 | 说明 | 参数 | 权限 / 备注 |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/users` | 用户列表 | — | 公开（代码未鉴权） |
| GET | `/api/admin/favorites/stats` | 收藏统计 | — | 公开（代码未鉴权） |
| DELETE | `/api/admin/users/delete/:id` | 删除用户 | path.id* | 公开（代码未鉴权） |
| POST | `/api/admin/poi/add` | 新增 POI | body.name*<br>body.type<br>body.latitude*<br>body.longitude*<br>body.description<br>body.comment<br>body.rating<br>body.open_time<br>body.hot | 公开（代码未鉴权） |
| PUT | `/api/admin/poi/update/:id` | 更新 POI | path.id*<br>body.name<br>body.type<br>body.latitude<br>body.longitude<br>body.description<br>body.comment<br>body.rating<br>body.open_time | 公开（代码未鉴权） |
| DELETE | `/api/admin/poi/delete/:id` | 删除 POI | path.id* | 公开（代码未鉴权） |
| POST | `/api/admin/charging/add` | 新增充电桩 | body.name*<br>body.location<br>body.latitude<br>body.longitude<br>body.status<br>body.power<br>body.total_slots<br>body.available_slots<br>body.price | 公开（代码未鉴权） |
| PUT | `/api/admin/charging/update/:id` | 更新充电桩 | path.id*<br>body.name<br>body.location<br>body.latitude<br>body.longitude<br>body.status<br>body.power<br>body.total_slots<br>body.available_slots<br>body.price | 公开（代码未鉴权） |
| DELETE | `/api/admin/charging/delete/:id` | 删除充电桩 | path.id* | 公开（代码未鉴权） |
| POST | `/api/admin/bus/add` | 新增校巴线路 | body.number*<br>body.name<br>body.start_station<br>body.end_station<br>body.operating_time<br>body.interval_minutes | 公开（代码未鉴权） |
| PUT | `/api/admin/bus/update/:id` | 更新校巴线路 | path.id*<br>body.number<br>body.name<br>body.start_station<br>body.end_station<br>body.operating_time<br>body.interval_minutes | 公开（代码未鉴权） |
| DELETE | `/api/admin/bus/delete/:id` | 删除校巴线路 | path.id* | 公开（代码未鉴权） |
| GET | `/api/admin/bus/stops` | 校巴站点列表 | — | 公开（代码未鉴权） |
| POST | `/api/admin/bus/stops/add` | 新增校巴站点 | body.name*<br>body.latitude*<br>body.longitude* | 公开（代码未鉴权） |
| PUT | `/api/admin/bus/stops/update/:id` | 更新校巴站点 | path.id*<br>body.name<br>body.latitude<br>body.longitude | 公开（代码未鉴权） |
| DELETE | `/api/admin/bus/stops/delete/:id` | 删除校巴站点 | path.id* | 公开（代码未鉴权） |
| POST | `/api/admin/bus/line/:id/stops` | 全量保存线路站点 | path.id*<br>body.stops* | 公开（代码未鉴权）<br>stops: [{ stop_id, sequence }] |
| GET | `/api/admin/bus/line/:id/stops` | 线路站点列表 | path.id* | 公开（代码未鉴权） |
| POST | `/api/admin/flower/upload` | 上传赏花图片 | form.image* | 公开（代码未鉴权）<br>multipart/form-data |
| DELETE | `/api/admin/flower/image/:filename` | 删除赏花图片 | path.filename* | 公开（代码未鉴权） |
| GET | `/api/admin/flower/list` | 管理端赏花点列表 | query.page=1<br>query.pageSize=10<br>query.type<br>query.status<br>query.keyword | 公开（代码未鉴权） |
| POST | `/api/admin/flower/add` | 新增赏花点 | body.name*<br>body.type<br>body.latitude<br>body.longitude<br>body.description<br>body.best_time<br>body.features<br>body.rating<br>body.status<br>body.images<br>body.has_video<br>body.has_360<br>body.has_live_stream | 公开（代码未鉴权） |
| PUT | `/api/admin/flower/update/:id` | 更新赏花点 | path.id*<br>body.name<br>body.type<br>body.latitude<br>body.longitude<br>body.description<br>body.best_time<br>body.features<br>body.rating<br>body.status<br>body.images<br>body.has_video<br>body.has_360<br>body.has_live_stream<br>body.checkin_count | 公开（代码未鉴权） |
| DELETE | `/api/admin/flower/delete/:id` | 删除赏花点 | path.id* | 公开（代码未鉴权） |
| GET | `/api/admin/news/list` | 管理端资讯列表 | query.page=1<br>query.pageSize=10<br>query.keyword | 公开（代码未鉴权） |
| POST | `/api/admin/news/add` | 新增资讯 | body.title*<br>body.content*<br>body.image<br>body.author | 公开（代码未鉴权） |
| PUT | `/api/admin/news/update/:id` | 更新资讯 | path.id*<br>body.title<br>body.content<br>body.image<br>body.author | 公开（代码未鉴权） |
| DELETE | `/api/admin/news/delete/:id` | 删除资讯 | path.id* | 公开（代码未鉴权） |
| GET | `/api/admin/flower/routes/list` | 管理端赏花路线列表 | query.page=1<br>query.pageSize=10<br>query.keyword | 公开（代码未鉴权） |
| POST | `/api/admin/flower/routes/add` | 新增赏花路线 | body.name*<br>body.duration<br>body.distance<br>body.difficulty<br>body.spots<br>body.description<br>body.best_time<br>body.tags<br>body.highlights<br>body.tips | 公开（代码未鉴权） |
| PUT | `/api/admin/flower/routes/update/:id` | 更新赏花路线 | path.id*<br>body.name<br>body.duration<br>body.distance<br>body.difficulty<br>body.spots<br>body.description<br>body.best_time<br>body.tags<br>body.highlights<br>body.tips | 公开（代码未鉴权） |
| DELETE | `/api/admin/flower/routes/delete/:id` | 删除赏花路线 | path.id* | 公开（代码未鉴权） |
| GET | `/api/admin/flower/spots/simple` | 赏花点简表 | — | 公开（代码未鉴权） |
| GET | `/api/admin/flower/checkins` | 打卡记录列表 | query.page=1<br>query.pageSize=20<br>query.spotId | 公开（代码未鉴权） |

## 实现注意事项

1. `GET /api/news/:id` 在 `GET /api/news/list` 前注册，Express 会把 `list` 当作 `id`；应调整路由顺序后再联调资讯列表。
2. `back/routes/admin-manage.js` 的业务管理接口当前没有挂载 `adminAuth`，因此文档按实际实现标为“公开（代码未鉴权）”；生产部署前应补齐鉴权。
3. 除用户信息和部分管理员接口外，多数业务接口直接信任客户端传入的 `userId`，并未从 JWT 推导用户身份。
4. `POST /api/charging/reserve` 未传 userId 时会回退为用户 1；这是当前实现行为，不建议用于生产环境。
5. 校巴实时位置与预计到站时间当前为模拟数据。

## 状态值摘要

- 充电桩 `status`：`0` 空闲、`1` 充电中、`2` 已预约、`3` 故障。
- 充电预约状态依当前代码使用：`1` 有效、`2` 已完成、`3` 已取消。
- 管理员 `role`：普通管理员与 `super`（超级管理员）；`status=1` 表示可登录。
- 停车场 `type`：`bike`、`ebike`、`car`。

## 静态资源与 WebSocket

- 图片：`GET /images/*`，映射到 `back/images/`。
- WebSocket：`ws://localhost:3001`，实际端口以 `WS_PORT` 为准，用于广播充电桩状态。
