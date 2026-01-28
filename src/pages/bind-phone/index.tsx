import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'
import { httpPost, httpPut } from '@/utils/http'
const LOGO_URL = 'https://6169-ai-accounting-5gprth66e60400be-1303796882.cos.ap-shanghai.myqcloud.com/ai-comment/ChatGPT%20Image%202026%E5%B9%B41%E6%9C%8821%E6%97%A5%2016_01_16.png'

const AuthorizePhone: React.FC = () => {
  const [loading, setLoading] = useState(false)

  // 处理关闭页面
  const handleClose = () => {
    Taro.navigateBack()
  }

  // 处理允许授权
  const handleGetPhoneNumber = async (e) => {
    console.log('handleGetPhoneNumber', e)
    try {
      setLoading(true)
      Taro.showLoading({ title: '授权中...' })
      // 调用微信手机号授权
      Taro.login({
        success: async (loginRes) => {
          if (loginRes.code) {
            try {
              // 发送code到服务器获取手机号
              const res = await httpPost('/api/user/phone', {
                code: loginRes.code
              })
              
              console.log('手机号授权成功:', res)
              Taro.showToast({ 
                title: '授权成功', 
                icon: 'success' 
              })
              
              // 延迟返回上一页
              setTimeout(() => {
                Taro.navigateBack()
              }, 1500)
            } catch (error) {
              console.error('授权失败:', error)
              Taro.showToast({ 
                title: '授权失败，请重试', 
                icon: 'error' 
              })
            }
          } else {
            console.error('登录失败:', loginRes.errMsg)
            Taro.showToast({ 
              title: '登录失败，请重试', 
              icon: 'error' 
            })
          }
        },
        fail: (error) => {
          console.error('登录失败:', error)
          Taro.showToast({ 
            title: '登录失败，请重试', 
            icon: 'error' 
          })
        }
      })
    } catch (error) {
      console.error('授权失败:', error)
      Taro.showToast({ 
        title: '授权失败，请重试', 
        icon: 'error' 
      })
    } finally {
      setLoading(false)
      Taro.hideLoading()
    }
  }

  // 处理隐私政策点击
  const handlePrivacyPolicy = () => {
    Taro.navigateTo({ url: '/pages/privacy-policy/index' })
  }

  return (
    <View className='authorize-phone-page'>
      {/* 顶部关闭按钮 */}
      {/* <View className='close-btn'>
        <View className='close-icon' onClick={handleClose}>
          <Text style={{ fontSize: '24px' }}>✕</Text>
        </View>
      </View> */}

      <View className='content'>
        {/* 应用信息 */}
        <View className='app-info'>
          <View 
            className='app-icon' 
            style={{ 
              backgroundImage: `url(${LOGO_URL})` 
            }}
          />
          <Text className='app-name'>好评生成助手</Text>
        </View>

        {/* 标题区域 */}
        <View className='header'>
          {/* <Text className='title'></Text> */}
          <Text className='description'>申请获取您的手机号,用于为您提供更个性化的服务及账号安全保障</Text>
        </View>
        
        {/* 手机图标 */}
        {/* <View className='icon-container'>
          <Text className='phone-icon'>📱</Text>
        </View> */}
      </View>
      
      {/* 底部按钮区域 */}
      <View className='footer'>
        <View className='buttons'>
          <Button 
            className='allow-btn'
            disabled={loading}
            openType='getPhoneNumber'
            onGetPhoneNumber={handleGetPhoneNumber}
          >
            {/* 微信图标 */}
            <View className='wechat-icon'>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.4 17.5c-2.4 0-4.6-.9-6.3-2.4C3.7 13.9 2.4 11.8 2.4 9.5 2.4 5.3 6.9 1.9 12.4 1.9c5.5 0 10 3.4 10 7.6 0 2.3-1.3 4.4-3.5 5.9-1.8 1.4-4.1 2.1-6.5 2.1zm5.1-6.5c.3 0 .6-.3.6-.6s-.3-.6-.6-.6c-.3 0-.6.3-.6.6s.3.6.6.6zm-5.1 0c.3 0 .6-.3.6-.6s-.3-.6-.6-.6c-.3 0-.6.3-.6.6s.3.6.6.6zm7.2 5.5c-.3 0-.6.2-.7.5-.5 1.1-1.4 2-2.5 2.5-.3.1-.5.4-.5.7 0 .3.2.6.5.7l.2.1c.3 0 .6-.1.8-.3 1.4-.7 2.6-1.8 3.2-3.2.1-.3 0-.7-.3-.9l-.7-.1zm-15.6.1c-.3.1-.4.4-.3.7.6 1.4 1.8 2.5 3.2 3.2.2.1.5.2.8.3.3 0 .5-.1.7-.3.2-.2.3-.5.2-.8-.1-.3-.3-.5-.6-.7-1.1-.5-2-1.4-2.5-2.5-.1-.3-.4-.5-.7-.5l-.8.1z"></path>
              </svg>
            </View>
            <Text className='btn-text'>微信用户一键授权</Text>
          </Button>
        </View>
        
        {/* 隐私政策 */}
        <View className='privacy'>
          <Text className='privacy-text'>
            点击“微信用户一键授权”即表示您同意我们的 
            <Text className='privacy-link' onClick={handlePrivacyPolicy}>《隐私政策》</Text>
            以便我们为您提供服务。
          </Text>
        </View>
      </View>
    </View>
  )
}

export default AuthorizePhone
