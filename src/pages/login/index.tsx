import { View, Text, Button, Checkbox, CheckboxGroup } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import './index.scss'
import { callLoginApi } from '@/api'
import { EVENT_NAMES, eventBus } from '@/utils/eventBus'
const LOGO_URL = 'https://6169-ai-accounting-5gprth66e60400be-1303796882.cos.ap-shanghai.myqcloud.com/ai-comment/ChatGPT%20Image%202026%E5%B9%B41%E6%9C%8821%E6%97%A5%2016_01_16.png'
export default function LoginPage() {
  const [agree, setAgree] = useState(false)

  const logoStyle = useMemo(() => ({
    backgroundImage: `url(${LOGO_URL})`,
  }), [])


  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 检查是否已经登录
    checkLoginStatus()
  }, [])

  // 检查登录状态
  const checkLoginStatus = () => {
    const token = Taro.getStorageSync('token')
    const savedUserInfo = Taro.getStorageSync('userInfo')

    if (token && savedUserInfo) {
      // 已登录，跳转到首页
      Taro.switchTab({
        url: '/pages/index/index'
      })
    }
  }



  // 微信登录（不获取用户信息）
  const handleWxLogin = async () => {
    if (loading) return;
    if(!agree) {
      Taro.showToast({
        title: '请先同意用户协议',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    setLoading(true)

    try {
      // 1. 获取微信授权code
      const loginRes = await Taro.login()

      if (!loginRes.code) {
        throw new Error('获取微信授权码失败')
      }

      // 2. 调用后端登录接口，用code换取openid和token
      const response = await callLoginApi(loginRes.code)

      // 3. 保存登录信息
      if (response.token) {
        Taro.setStorageSync('token', response.token)
        Taro.setStorageSync('userInfo', {
          openid: response.openid,
          ...response.userInfo
        })

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        })

        // 4. 跳转到首页
        setTimeout(() => {
          Taro.navigateBack({
            delta: 1
          })
          // 5. 延迟发送登录成功事件，确保页面跳转完成后再刷新数据
          setTimeout(() => {
            eventBus.emit(EVENT_NAMES.LOGIN_SUCCESS)
          }, 500)
        }, 1500)
      } else {
        throw new Error('登录失败，未获取到token')
      }

    } catch (error: any) {
      console.error('登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }
  return (
    <View className='login-page'>
      {/* Main Content Area */}
      <View className='main-area'>
        {/* Branding */}
        <View className='branding'>
          {/* Logo */}
          <View className='logo' style={logoStyle} />
          {/* Text Branding */}
          <View className='brand-text'>
            <View className='title'>好评生成助手</View>
            <View className='subtitle'>一键生成大众点评优质好评</View>
            <View className='subtitle'>让您的店铺口碑飙升</View>
          </View>
        </View>
      </View>

      {/* Bottom Action Area */}
      <View className='action-area'>
        {/* Legal / Compliance */}
        <View className='terms'>
          <CheckboxGroup
            onChange={(e) => setAgree(e.detail.value.includes('agree'))}
          >
            <Checkbox
              className='terms-checkbox'
              value='agree'
              checked={agree}
              color='#FACC15'
            >
              <Text className='terms-text'>
                我已阅读并同意
                <Text className='link' onClick={() => Taro.navigateTo({ url: '/pages/user-agreement/index' })}>《用户协议》</Text>
                和
                <Text className='link' onClick={() => Taro.navigateTo({ url: '/pages/privacy-policy/index' })}>《隐私政策》</Text>
              </Text>
            </Checkbox>
          </CheckboxGroup>

        </View>

        {/* Login Button */}
        <View className='login-btn-wrap'>
          <Button
            className={`login-btn ${agree ? 'active' : 'disabled'}`}
            onClick={handleWxLogin}
          >
            {/* <Text className='btn-icon'>💬</Text> */}
            <Text className='btn-text'>微信一键登录</Text>
          </Button>
        </View>

        {/* Footer */}
        <Text className='version'>v1.0.0</Text>
      </View>
    </View>
  )
}