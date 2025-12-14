import { View, Text } from '@tarojs/components'
import { useMemo } from 'react'
import './index.scss'

const AVATAR_URL = 'https://picsum.photos/200'

export default function ProfilePage() {
  const avatarStyle = useMemo(() => ({
    backgroundImage: `url(${AVATAR_URL})`,
  }), [])

  return (
    <View className='profile-page'>

      {/* Profile Section */}
      <View className='profile-section'>
        <View className='avatar-wrap'>
          <View className='avatar' style={avatarStyle} />
          <View className='edit-badge'>
            <Text className='icon small'>✎</Text>
          </View>
        </View>
        <View className='profile-info'>
          <Text className='profile-name'>美食达人_01</Text>
          {/* <View className='profile-meta'>
            <Text className='profile-id'>ID: 8839201</Text>
            <View className='dot' />
            <View className='vip-tag'>
              <Text className='icon tiny'>✔</Text>
              <Text className='vip-text'>VIP 会员</Text>
            </View>
          </View> */}
        </View>
      </View>

      {/* Stats Dashboard */}
      {/* <View className='stats'>
        <View className='stat-card'>
          <Text className='stat-number'>124</Text>
          <Text className='stat-label'>已生成</Text>
        </View>
        <View className='stat-card'>
          <Text className='stat-number'>15</Text>
          <Text className='stat-label'>收藏夹</Text>
        </View>
         <View className='stat-card'>
          <Text className='stat-number'>3</Text>
          <Text className='stat-label'>草稿箱</Text>
        </View> 
      </View> */}

      {/* Menu Groups */}
      <View className='menu-group'>
        <Text className='section-title'>常用功能</Text>
        <View className='menu-card'>
          <View className='menu-item'>
            <View className='menu-icon primary'>
              <Text className='icon'>⏱</Text>
            </View>
            <View className='menu-content'>
              <Text className='menu-title'>历史好评记录</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View>
          <View className='menu-item'>
            <View className='menu-icon primary'>
              <Text className='icon'>❤</Text>
            </View>
            <View className='menu-content'>
              <Text className='menu-title'>收藏的模板</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View>
          <View className='menu-item'>
            <View className='menu-icon primary'>
              <Text className='icon'>◆</Text>
            </View>
            <View className='menu-content with-badge'>
              <Text className='menu-title'>会员计划</Text>
              <Text className='upgrade-badge'>UPGRADE</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View>
        </View>
      </View>

      {/* <View className='menu-group'>
        <Text className='section-title'>其他</Text>
        <View className='menu-card'>
          <View className='menu-item'>
            <View className='menu-icon neutral'>
              <Text className='icon'>💬</Text>
            </View>
            <View className='menu-content'>
              <Text className='menu-title'>意见反馈</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View>
          <View className='menu-item'>
            <View className='menu-icon neutral'>
              <Text className='icon'>⚙</Text>
            </View>
            <View className='menu-content'>
              <Text className='menu-title'>设置</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View>
        </View>
      </View> */}

      <View className='page-bottom' />
    </View>
  )
}