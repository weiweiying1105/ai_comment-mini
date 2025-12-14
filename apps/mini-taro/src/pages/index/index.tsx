import { FC, useMemo, useState } from 'react'
import { View, Text, Button, Slider, Textarea } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'

const CATEGORY_LIST = [
  { key: 'food', label: '美食', icon: '🍽️' },
  { key: 'drink', label: '饮品', icon: '☕' },
  { key: 'hotel', label: '酒店', icon: '🏨' },
  { key: 'beauty', label: '美容', icon: '🌿' },
  { key: 'fitness', label: '健身', icon: '🏋️' },
  { key: 'entertain', label: '娱乐', icon: '🎮' },
  { key: 'parenting', label: '亲子', icon: '👶' },
  { key: 'more', label: '更多', icon: '➕' },
]

const OPTION_TAGS = [
  { key: 'warm', label: '语气更热情' },
  { key: 'photo', label: '提到拍照好看' },
  { key: 'value', label: '强调性价比' },
]

const Profile: FC = () => {
  const [category, setCategory] = useState('food')
  const [limit, setLimit] = useState(150)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [result, setResult] = useState('')

  const handleToggleOption = (key: string) => {
    setSelectedOptions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const hintText = useMemo(() => {
    return '点击下方按钮，生成在大众点评上的完美好评…'
  }, [])

  const buildReview = () => {
    const catLabel = CATEGORY_LIST.find(c => c.key === category)?.label || '美食'
    const parts: string[] = []

    parts.push(`这次来${catLabel}真的太惊喜了！环境干净整洁，服务贴心专业。`)

    if (selectedOptions.includes('warm')) {
      parts.push('从进店到离开，每个细节都让人感觉到满满的热情与周到。')
    }
    if (selectedOptions.includes('photo')) {
      parts.push('随手一拍都是大片，无论是灯光还是摆设都很出片，朋友们都夸赞照片好看。')
    }
    if (selectedOptions.includes('value')) {
      parts.push('价格非常实在，分量足、品质好，性价比真的很高，绝对值得再次打卡。')
    }

    parts.push('总体体验十分满意，会推荐给身边的朋友，有机会还会再来！')

    let text = parts.join('')
    if (text.length > limit) {
      text = text.slice(0, limit - 1) + '…'
    }
    setResult(text)
  }
const goAllCategory =()=>{
  Taro.navigateTo({
    url: '/pages/allCategory/index'
  })
}
  return (
    <View className='profile-page'>
      <View className='section'>
        <View className='section-header'>
          <View className='section-title'>选择类别</View>
          <Text className='section-more' onClick={()=>goAllCategory()}>查看更多</Text>
        </View>
        <View className='category-grid'>
          {CATEGORY_LIST.map(item => (
            <View
              key={item.key}
              className={`category-item ${category === item.key ? 'active' : ''}`}
              onClick={() => setCategory(item.key)}
            >
              <View className={`icon-circle ${category === item.key ? 'active' : ''}`}>
                <Text className='icon'>{item.icon}</Text>
              </View>
              <Text className={`label ${category === item.key ? 'active' : ''}`}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='divider' />

      <View className='section'>
        <View className='section-header'>
          <View className='section-title'>字数限制</View>
          <Text className='limit-highlight'>{limit}字</Text>
        </View>
        <Slider
          min={50}
          max={300}
          step={1}
          value={limit}
          onChange={(e) => setLimit(Number(e.detail.value))}
        />
      </View>

      <View className='section'>
        <View className='section-header'>
          <View className='section-title'>生成结果</View>
          <Text className='copy-hint'>📋 复制</Text>
        </View>
        <View className='result-box'>
          <Textarea
            className='result-textarea'
            value={result}
            placeholder={hintText}
            maxlength={300}
            showConfirmBar={false}
            autoHeight
          />
        </View>
      </View>

      <View className='options'>
        {OPTION_TAGS.map(opt => (
          <View
            key={opt.key}
            className={`option-tag ${selectedOptions.includes(opt.key) ? 'checked' : ''}`}
            onClick={() => handleToggleOption(opt.key)}
          >
            <Text>{opt.label}</Text>
          </View>
        ))}
      </View>

      <View className='footer'>
        <Button className='generate-btn' onClick={buildReview}>✨ 生成好评</Button>
      </View>
    </View>
  )
}

export default Profile
