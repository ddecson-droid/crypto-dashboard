// ====== 应用启动入口 ======
// 这个文件是你整个 React 应用的第一行代码
// 它做的事：找到 index.html 里 id="root" 的空 div，把 App 组件挂上去
// Vite 模板自动生成的，你没有改

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // 引入全局样式（Tailwind 指令 + 暗色背景）
import App from './App.tsx' // 引入根组件（你自己写的）

// createRoot：React 18 的新 API，代替旧的 ReactDOM.render
// document.getElementById('root')! ：找到 index.html 里的 <div id="root"></div>
// 后面的 ! 告诉 TS 「这个元素一定存在，不会是 null」
// .render(<App />)：把 App 组件画到这个 div 里
// StrictMode：开发时多渲染一次帮你发现潜在 bug，生产环境自动失效
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
