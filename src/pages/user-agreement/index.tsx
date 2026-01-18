import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.less'

const UserAgreement: React.FC = () => {
  return (
    <View className='agreement-container'>
      <ScrollView className='agreement-content'>
        <Text className='agreement-title'>用户协议</Text>
        
        <Text className='agreement-section-title'>1. 协议的接受</Text>
        <Text className='agreement-text'>
          欢迎使用AI帮我记应用（以下简称"本应用"）。本协议是您与本应用之间关于使用本应用服务的法律协议。
        </Text>
        <Text className='agreement-text'>
          您在使用本应用前，请仔细阅读并理解本协议的所有条款。一旦您使用本应用，即表示您同意接受本协议的全部条款。
        </Text>
        
        <Text className='agreement-section-title'>2. 服务内容</Text>
        <Text className='agreement-text'>
          本应用为您提供个人记账、消费统计、数据分析等服务。我们有权根据业务发展需要调整服务内容。
        </Text>
        
        <Text className='agreement-section-title'>3. 用户权利和义务</Text>
        <Text className='agreement-text'>
          3.1 您有权使用本应用提供的各项服务，但需遵守本协议的规定。
        </Text>
        <Text className='agreement-text'>
          3.2 您应确保您提供的信息真实、准确、完整，并及时更新。
        </Text>
        <Text className='agreement-text'>
          3.3 您应妥善保管您的账号和密码，对您账号下的所有操作负责。
        </Text>
        <Text className='agreement-text'>
          3.4 您不得利用本应用从事任何违法违规的活动。
        </Text>
        
        <Text className='agreement-section-title'>4. 应用的权利和义务</Text>
        <Text className='agreement-text'>
          4.1 我们有权在必要时修改本协议。
        </Text>
        <Text className='agreement-text'>
          4.2 我们有义务维护应用的正常运行，保障用户数据的安全。
        </Text>
        <Text className='agreement-text'>
          4.3 我们有权对用户的违规行为进行处理，包括但不限于暂停或终止服务。
        </Text>
        
        <Text className='agreement-section-title'>5. 知识产权</Text>
        <Text className='agreement-text'>
          本应用的所有内容，包括但不限于文字、图片、音频、视频等，均受知识产权法的保护。未经我们授权，您不得复制、修改、传播或用于商业目的。
        </Text>
        
        <Text className='agreement-section-title'>6. 责任限制</Text>
        <Text className='agreement-text'>
          在法律允许的范围内，我们对因使用本应用而产生的任何间接损失不承担责任。
        </Text>
        
        <Text className='agreement-section-title'>7. 协议的变更</Text>
        <Text className='agreement-text'>
          我们有权根据需要修改本协议。修改后的协议将在应用内公布，您继续使用本应用即表示同意接受修改后的协议。
        </Text>
        
        <Text className='agreement-section-title'>8. 协议的终止</Text>
        <Text className='agreement-text'>
          您可以随时停止使用本应用。我们也有权在您违反本协议时终止向您提供服务。
        </Text>
        
        <Text className='agreement-section-title'>9. 法律适用</Text>
        <Text className='agreement-text'>
          本协议的解释和执行均适用中华人民共和国法律。
        </Text>
        
        <Text className='agreement-date'>更新日期：2024年12月1日</Text>
      </ScrollView>
    </View>
  )
}

export default UserAgreement
