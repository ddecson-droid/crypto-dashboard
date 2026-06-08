// ====== Tailwind CSS 配置 ======
// 这个文件告诉 Tailwind：「去哪些文件里扫描我用到的 class 名」
// 如果不配 content 数组，Tailwind 不知道你用了 bg-gray-900 之类的 class，就不会生成对应 CSS
// 结果：所有样式全部失效，页面一片白

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // 入口 HTML 文件
    "./src/**/*.{js,ts,jsx,tsx}", // src 下所有层级的 .ts/.tsx/.js/.jsx 文件
    // **  = 任意深度的子文件夹
    // *.{js,ts,jsx,tsx} = 后缀是 js/ts/jsx/tsx 的所有文件
  ],
  theme: {
    extend: {}, // 可以在这里扩展默认颜色/间距/字体，本项目用 Tailwind 默认值
  },
  plugins: [], // 可以加载 Tailwind 插件，本项目不需要
}
