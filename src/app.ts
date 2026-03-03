import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'

import './app.scss'
import { httpGet } from './utils/http'
import { setUserInfo } from './utils/auth'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(function () {
    console.log('useLaunch',this)
    this.globalData={
      userInfo: null,
      lastUserInfoCheckTime: 0
    }
      // 启动时，把本地缓存的 userInfo 读进来
    const cache = Taro.getStorageSync('USER_INFO')
    if (cache) {
      this.globalData.userInfo = cache.userInfo || null
      this.globalData.lastUserInfoCheckTime = cache.lastUserInfoCheckTime || 0
    }else{
      httpGet('/api/user/info').then(res => {
        this.globalData.userInfo = res || null
        this.globalData.lastUserInfoCheckTime = Date.now()
        setUserInfo(res)
      })
    }
  })

  // children 是将要会渲染的页面
  return children
}
  


export default App
