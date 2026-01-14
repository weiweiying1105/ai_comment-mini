import { View, Text, Button, Image, Input } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import './index.scss'
import Taro from '@tarojs/taro'
import { httpGet, httpPut, put } from '@/utils/http'
interface UserInfo {
  avatarUrl: string,
  nickName: string,
  id: string
}
const AVATAR_URL = 'https://picsum.photos/200'
  // Cloudinary配置
const CLOUDINARY_CONFIG = {
  cloud_name: "dc6wdjxld",
  upload_preset: "ai-accounting",
  api_key: "925588468673723",
  api_secret: "gBuAbiJsd-4jaWEDqpCkbwNMogk",
};
export default function ProfilePage() {
  const avatarStyle = useMemo(() => ({
    backgroundImage: `url(${AVATAR_URL})`,
  }), [])
  const [user, setUser] = useState<{
    avatarUrl: string,
    nickName: string,
    id: string
  }>({
    avatarUrl: '',
    nickName: '',
    id: ''
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  useEffect(() => {
    // 获取用户信息
    const load = async () => {
      const user = await httpGet('/api/user/info')
      console.log(user)
      setUser(user)
    }
    load()
  }, [])

  // 选择头像
  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail
    console.log('选择头像:', avatarUrl)
    
    // 先更新临时头像显示
    setUser(prev => ({
      ...prev,
      avatarUrl
    }))
    
    // 上传头像到服务器获取永久地址
    uploadAvatarToServer(avatarUrl).then((permanentAvatarUrl) => {
      console.log('永久头像地址:', permanentAvatarUrl)
    
      // 使用函数形式的setState确保获取最新状态
      setUser(prevState => {
        const updatedUser = {
          ...prevState,
          avatarUrl: permanentAvatarUrl
        }
        // 在setState回调中调用保存函数，确保使用最新的状态
        handleSaveUser(updatedUser)
        return updatedUser
      })
    })
  }
  
  // 上传头像到服务器
  const uploadAvatarToServer = async (tempAvatarUrl: string) => {
    try {
      setLoading(true)
      Taro.showLoading({ title: '上传头像中...' })
      
      const uploadResult = await new Promise<string>((resolve, reject) => {
        Taro.uploadFile({
          url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
          filePath: tempAvatarUrl,
          name: "file",
          formData: {
            file: tempAvatarUrl,
            upload_preset: CLOUDINARY_CONFIG.upload_preset,
          },
          success(res) {
            try {
              const data = JSON.parse(res.data);
               console.log("处理返回结果", data);
              if (data.error) {
                reject(new Error(data.error.message));
              } else {
                const url = data.url || data.secure_url;
                resolve(url);
              }
            } catch (error) {
              reject(new Error('解析响应数据失败'));
            }
          },
          fail(error) {
            reject(error);
          }
        });
      });
      
      // 更新头像URL
      setUser(prev => {
        // 更新本地存储
        Taro.setStorageSync('user', {
          ...prev,
          avatarUrl: uploadResult
        });
        return {
          ...prev,
          avatarUrl: uploadResult
        };
      });
      Taro.showToast({
        title: '头像上传成功',
        icon: 'success'
      });
      
      Taro.hideLoading()
      return uploadResult;
    } catch (error) {
      console.error('上传头像失败:', error)
      Taro.showToast({
        title: '头像上传失败',
        icon: 'error'
      })
      Taro.hideLoading()
    } finally {
      setLoading(false)
    }
  }
  
  // 输入昵称
  const handleNicknameInput = (e: any) => {
    const nickName = e.detail.value
    console.log('输入昵称:', nickName)
    setIsEditing(true)
    setUser(prev => ({
      ...prev,
      nickName
    }))
    handleSaveUser({
      ...user,
      nickName
    })
  }

  // 保存用户信息
  const handleSaveUser =async (data?: UserInfo) => {
    // 使用传入的数据或当前状态
    const currentUser = data || user
    
    // 更新本地存储的用户信息
    const savedUser = Taro.getStorageSync('user') || {}
    if (currentUser.nickName) { 
      savedUser.nickName = currentUser.nickName
    }
    if (currentUser.avatarUrl) {
      savedUser.avatarUrl = currentUser.avatarUrl
    }
    const updatedUser = {
      ...currentUser
    }
   const res = await httpPut('/api/user/info', updatedUser)
  console.log('更新用户信息成功:',res)
    Taro.setStorageSync('user', updatedUser)

    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    })

    // 延迟返回上一页
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  // 返回上一页
  const handleGoBack = () => {
    Taro.navigateBack()
  }
  return (
    <View className='profile-page'>

      {/* Profile Section */}
      <View className='profile-section'>
        <View className='avatar-wrap'>
          {/* <View className='avatar' style={avatarStyle} /> */}

          <Button
            className='avatar-btn'
            openType='chooseAvatar'
            onChooseAvatar={handleChooseAvatar}
            disabled={loading}
          >
            {user.avatarUrl ? (
              <Image
                className='avatar'
                src={user.avatarUrl}
                mode='aspectFill'
              />
            ) : (
              <View className='avatar' style={avatarStyle} />
            )}
          </Button>


          <View className='edit-badge' onClick={() => Taro.navigateTo({ url: '/pages/setUserInfo/index' })}>
            <Text className='icon small'>✎</Text>
          </View>
        </View>
        <View className='profile-info'>
         <Input
            className='profile-name'
            type='nickname'
            placeholder='请输入昵称'
            value={user.nickName}
            onInput={handleNicknameInput}
            maxlength={20}
            focus={false}
          />
          {/* <Text className='profile-name' style={{ display: isEditing ? 'none' : 'block' }}>{user.nickName || '美食达人'}</Text> */}
        </View>
      </View>

      {/* Menu Groups */}
      <View className='menu-group'>
        <Text className='section-title'>常用功能</Text>
        <View className='menu-card'>
          <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/pages/records/index' })}>
            <View className='menu-icon primary'>
              <Text className='icon'>⏱</Text>
            </View>
            <View className='menu-content'>
              <Text className='menu-title'>历史好评记录</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View>
          <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/pages/templates/index' })}>
            <View className='menu-icon primary'>
              <Text className='icon'>❤</Text>
            </View>
            <View className='menu-content' >
              <Text className='menu-title'>收藏的模板</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View>
          {/* <View className='menu-item'>
            <View className='menu-icon primary'>
              <Text className='icon'>◆</Text>
            </View>
            <View className='menu-content with-badge'>
              <Text className='menu-title'>会员计划</Text>
              <Text className='upgrade-badge'>UPGRADE</Text>
            </View>
            <Text className='chevron'>›</Text>
          </View> */}
        </View>
      </View>

      <View className='page-bottom' />
    </View>
  )
}