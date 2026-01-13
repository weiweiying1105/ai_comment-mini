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
  ],
  tabBar: {
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
