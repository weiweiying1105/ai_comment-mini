export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/profile/index',
    'pages/allCategory/index',
    'pages/login/index',
    "pages/privacy-policy/index",
    "pages/user-agreement/index",
    "pages/records/index",
    "pages/templates/index",
    "pages/proCreate/index",
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
        text: '专业模式',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png'
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
