import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.less'

const PrivacyPolicy: React.FC = () => {
  return (
    <View className='policy-container'>
      <ScrollView className='policy-content'>
        <Text className='policy-title'>隐私政策</Text>
        
        <Text className='policy-section-title'>1. 引言</Text>
        <Text className='policy-text'>
          欢迎使用AI帮我记应用（以下简称"本应用"）。我们非常重视您的隐私保护和个人信息安全。本隐私政策旨在向您说明我们在收集、使用、存储和保护您的个人信息方面的做法，请您仔细阅读。
        </Text>
        
        <Text className='policy-section-title'>2. 我们收集的信息</Text>
        <Text className='policy-text'>
          2.1 注册信息：当您注册或登录本应用时，我们会收集您的微信头像、昵称等信息。
        </Text>
        <Text className='policy-text'>
          2.2 使用信息：我们会收集您使用本应用的相关信息，包括但不限于记账记录、消费习惯等。
        </Text>
        <Text className='policy-text'>
          2.3 设备信息：为了保障应用的正常运行，我们可能会收集您的设备型号、操作系统版本等信息。
        </Text>
        
        <Text className='policy-section-title'>3. 信息的使用</Text>
        <Text className='policy-text'>
          3.1 提供服务：我们使用您的个人信息为您提供记账、统计分析等核心功能。
        </Text>
        <Text className='policy-text'>
          3.2 改进服务：我们会根据您的使用情况不断改进和优化应用功能。
        </Text>
        <Text className='policy-text'>
          3.3 安全保障：我们使用您的信息来确保应用的安全性和稳定性。
        </Text>
        
        <Text className='policy-section-title'>4. 信息的保护</Text>
        <Text className='policy-text'>
          我们采取各种安全措施保护您的个人信息，防止信息泄露、丢失或被滥用。
        </Text>
        
        <Text className='policy-section-title'>5. 信息的共享</Text>
        <Text className='policy-text'>
          我们不会向第三方出售或出租您的个人信息，但在以下情况下可能会共享您的信息：
        </Text>
        <Text className='policy-text'>
          - 获得您的明确同意；
        </Text>
        <Text className='policy-text'>
          - 遵守法律法规要求；
        </Text>
        <Text className='policy-text'>
          - 保护我们的合法权益。
        </Text>
        
        <Text className='policy-section-title'>6. 政策的更新</Text>
        <Text className='policy-text'>
          本隐私政策可能会根据法律、法规的变化或业务发展的需要进行更新。更新后的政策将在应用内公布。
        </Text>
        
        <Text className='policy-section-title'>7. 联系我们</Text>
        <Text className='policy-text'>
          如果您对本隐私政策有任何疑问，请通过应用内的联系方式与我们联系。
        </Text>
        
        <Text className='policy-date'>更新日期：2024年12月1日</Text>
      </ScrollView>
    </View>
  )
}

export default PrivacyPolicy
