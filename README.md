# 🏮 灯笼长廊 - 3D节日漫游

基于 Three.js 的 3D 互动灯笼长廊网页应用，复刻县城步行街节日灯笼景观，支持第一人称漫游体验。

## ✨ 功能特性

- **沉浸式 3D 场景**：简模街道建筑，两侧悬挂 250+ 红灯笼
- **Instancing 优化**：使用 `THREE.InstancedMesh` 渲染 250+ 灯笼，仅需 1 次 Draw Call
- **动态光照**：灯笼点光源池机制，只照亮相机附近灯笼
- **地面反射**：金属度 + 粗糙度模拟轻微地面反射效果
- **第一人称漫游**：
  - 桌面端：WASD 移动 + 鼠标视角（Pointer Lock）
  - 移动端：触屏虚拟摇杆 + 触摸滑动视角
- **智能 Tooltip**：靠近灯笼自动显示祝福语，JSON 可配置
- **日夜模式切换**：一键切换日/夜场景氛围
- **Bloom 后处理**：夜间模式可选 Bloom 光晕效果
- **性能监控**：实时 FPS 显示，灯笼数量统计

## 🖥️ 最低 WebGL 要求

| 指标 | 最低要求 | 推荐配置 |
|------|----------|----------|
| WebGL 版本 | WebGL 2.0 | WebGL 2.0 |
| 显卡 | 集成显卡（Intel UHD 620+） | 独立显卡（GTX 1050+） |
| 显存 | 512MB | 2GB+ |
| CPU | 双核 2.0GHz | 四核 2.5GHz+ |
| 内存 | 4GB | 8GB+ |
| 浏览器 | Chrome 90+ / Firefox 88+ / Safari 15+ | Chrome 120+ / Edge 120+ |

## 📊 性能验收标准

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 帧率 | 桌面端 ≥ 60fps<br>移动端 ≥ 30fps | 稳定运行不卡顿 |
| 灯笼数量 | ≥ 250 个 | 使用 InstancedMesh 优化 |
| 加载时间 | ≤ 5s | 4G 网络环境下首屏加载 |
| 内存占用 | ≤ 500MB | 运行时峰值内存 |
| 电池消耗 | 1 小时 ≤ 30% | 移动端连续使用 |
| Draw Call | ≤ 50 | 主要场景渲染 |

## 🎮 操作说明

### 桌面端
- **点击画面**：锁定鼠标视角
- **W / ↑**：向前移动
- **S / ↓**：向后移动
- **A / ←**：向左移动
- **D / →**：向右移动
- **ESC**：解锁鼠标

### 移动端
- **左侧摇杆**：控制移动方向
- **右侧滑动**：控制视角方向
- **靠近灯笼**：自动显示祝福语

## 📁 项目结构

```
src/
├── components/
│   ├── LanternScene/
│   │   ├── LanternScene.tsx    # 3D 场景主组件
│   │   ├── Ground.tsx          # 地面与道路
│   │   ├── Street.tsx          # 街道建筑
│   │   └── Lanterns.tsx        # 灯笼阵列（InstancedMesh）
│   ├── UI/
│   │   ├── Controls.tsx        # 日夜模式切换
│   │   ├── Joystick.tsx        # 触屏虚拟摇杆
│   │   ├── Tooltip.tsx         # 祝福语提示
│   │   └── FPSCounter.tsx      # 性能计数器
│   └── LoadingScreen.tsx       # 加载界面
├── hooks/
│   ├── usePlayerControl.ts     # 玩家移动控制
│   └── useLanternTooltip.ts    # 灯笼提示检测
├── store/
│   └── useGameStore.ts         # 全局状态管理
├── config/
│   ├── blessings.json          # 祝福语配置（可编辑）
│   └── sceneConfig.json        # 场景参数配置
├── types/
│   └── index.ts                # TypeScript 类型定义
├── pages/
│   └── Home.tsx                # 主页面
└── App.tsx
```

## 🛠️ 技术栈

- **框架**：React 18 + TypeScript + Vite 6
- **3D 引擎**：Three.js 0.169
- **React-Three 绑定**：@react-three/fiber 8.17 + @react-three/drei 9.114
- **后处理**：@react-three/postprocessing 2.16
- **样式**：Tailwind CSS 3.4
- **状态管理**：Zustand 5.0
- **图标**：lucide-react 0.511
- **部署**：Docker + Nginx

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### Docker 部署

```bash
# 构建并启动容器
docker-compose up -d --build

# 停止容器
docker-compose down

# 查看日志
docker-compose logs -f
```

部署后访问：`http://localhost:8080`

### 直接使用 Nginx

```bash
# 构建项目
npm run build

# 将 dist 目录复制到 Nginx 站点目录
cp -r dist/* /usr/share/nginx/html/

# 使用项目自带的 nginx.conf
cp nginx.conf /etc/nginx/conf.d/lantern.conf
```

## ✏️ 自定义祝福语

编辑 `src/config/blessings.json` 文件添加或修改祝福语：

```json
{
  "blessings": [
    { "id": 1, "text": "新年快乐，万事如意！", "category": "festival" },
    { "id": 2, "text": "阖家团圆，幸福安康！", "category": "family" },
    { "id": 3, "text": "财源广进，步步高升！", "category": "career" }
  ]
}
```

- `id`：唯一标识符
- `text`：祝福语内容
- `category`：分类标签（festival / family / career / health / study 等）

## ⚙️ 场景配置

编辑 `src/config/sceneConfig.json` 调整场景参数：

```json
{
  "street": {
    "length": 200,    // 街道长度
    "width": 8        // 街道宽度
  },
  "lanterns": {
    "count": 250,           // 灯笼数量
    "minSpacing": 2,        // 最小间距
    "maxSpacing": 4,        // 最大间距
    "minHeight": 3,         // 最低悬挂高度
    "maxHeight": 4          // 最高悬挂高度
  },
  "player": {
    "speed": 5,                   // 移动速度
    "mouseSensitivity": 0.002     // 鼠标灵敏度
  },
  "tooltip": {
    "triggerDistance": 3    // 祝福语触发距离
  }
}
```

## 🔧 性能优化策略

| 优化项 | 方案 | 效果 |
|--------|------|------|
| 灯笼渲染 | InstancedMesh + 自定义着色器 | 250 个灯笼仅 1 次 Draw Call |
| 点光源 | 灯光池（24 个） + 距离剔除 | 控制同时激活光源数量 |
| 碰撞检测 | 空间网格（Spatial Grid）加速 | O(n) → O(1) 平均查询 |
| 后处理 | 仅夜间启用 Bloom | 日间减少 50% 渲染开销 |
| 几何体 | 低多边形基础几何体 | 减少顶点处理压力 |
| 材质 | 合并材质 + 共享 Uniform | 减少 WebGL 状态切换 |
| DPR | 限制设备像素比 [1, 2] | 平衡画质与性能 |

## 📝 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run check` | TypeScript 类型检查 |

## 📄 License

MIT License

---

🏮 愿这个灯笼长廊能带给你节日的温馨与祝福！
