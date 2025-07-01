# 美团附近站点查询 (Meituan Station Finder)

这是一个基于 Next.js 和高德地图构建的 Web 应用，旨在帮助用户快速查找其当前位置或指定地址附近的“美团站点”。应用能够清晰地在地图上展示所有站点的分布，并提供多种出行方式（驾车、骑行、步行、公交）的路线规划、距离和预计时间。

## ✨ 主要功能 (Key Features)

- **地址自动补全**: 在输入地址时，由高德地图提供智能建议。
- **精准定位与搜索**:
    - 点击“我的位置”按钮，通过**浏览器 `Geolocation API`** 获取当前坐标，并在地图上显示。
    - 在搜索框中输入地址后，通过**高德地图地理编码 API** 将文本地址转换为精确坐标进行搜索。
- **多模式路线规划**: 提供驾车、步行、骑行和公交四种出行方式的路线规划。
- **地图可视化**: 在高德地图上直观展示站点、用户位置及规划路线。
- **详细信息展示**: 显示站点的详细地址、距离以及预估的行程时间和距离。
- **响应式设计**: 适配桌面和移动设备，在手机上提供优化的折叠式列表视图。
- **搜索历史**: 自动保存最近的搜索记录，方便快速再次查询。

## 🚀 快速开始 (Getting Started)

要运行此项目，您需要先设置一些环境变量。

1.  在项目根目录创建一个 `.env` 文件 (您可以复制 `.env.example`)。
2.  在 `.env` 文件中填入您的高德地图 API 密钥：

    ```env
    # 您需要前往高德开放平台(https://lbs.amap.com/)申请一个Web端(JS API)的Key和安全密钥。
    NEXT_PUBLIC_AMAP_KEY="YOUR_AMAP_KEY"
    NEXT_PUBLIC_AMAP_SECURITY_JS_CODE="YOUR_AMAP_SECURITY_JS_CODE"
    ```

3.  安装依赖并运行开发服务器：

    ```bash
    npm install
    npm run dev
    ```

现在，您可以在浏览器中访问应用了。

## 🛠️ 技术栈 (Tech Stack)

- **框架 (Framework)**: Next.js & React
- **语言 (Language)**: TypeScript
- **UI 组件库 (UI Components)**: ShadCN UI
- **样式 (Styling)**: Tailwind CSS
- **地图服务 (Map Service)**: 高德地图 (AMap) - 用于地图展示、地理编码/逆地理编码、路线规划和地址自动补全。
- **后端流程 (Backend Flow)**: Genkit - 用于封装和管理后端逻辑。
