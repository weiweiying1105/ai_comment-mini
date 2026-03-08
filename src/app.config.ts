export default defineAppConfig({
  pages: [
    // 主包仅保留 TabBar 页（小程序要求 TabBar 只能在主包）
    'pages/index/index',
    'pages/proCreate/index',
    'pages/profile/index'
  ],
  // 分包配置：非 TabBar 页移动到分包，减小主包体积
  subPackages: [
    { root: 'pages/login', pages: ['index'] },
    { root: 'pages/allCategory', pages: ['index'] },
    { root: 'pages/templates', pages: ['index'] },
    { root: 'pages/records', pages: ['index'] },
    { root: 'pages/privacy-policy', pages: ['index'] },
    { root: 'pages/user-agreement', pages: ['index'] },
    { root: 'pages/bind-phone', pages: ['index'] },
  ],
  tabBar: {
    color: '#4B5563',           // 未选中项文字颜色
    selectedColor: '#ffd400',   // 选中项文字颜色
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '一键生成',
        // 图标需使用本地相对路径，建议放在 src/assets/
        iconPath: 'assets/tab-profile.png',
        selectedIconPath: 'assets/tab-profile-active.png'
      },
      {
        pagePath: 'pages/proCreate/index',
        text: '美食专业模式',
        iconPath: 'assets/pro.png',
        selectedIconPath: 'assets/pro-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  }
})
