// pages/ai-review/index.tsx
import { View, Text, ScrollView, Textarea, Image, Button } from '@tarojs/components'
import './index.scss'
import { debounce } from '@/utils/debounce'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { httpPost } from '@/utils/http'
  const BASE_URL = (typeof process !== 'undefined' && (process as any).env && (process as any).env.BASE_URL)
        ? (process as any).env.BASE_URL
        : 'http://localhost:3000'
// 语气选项
const TONE_OPTION_TAGS = [
  { key: 'sincere', label: '真诚推荐' },
  { key: 'hot', label: '热情夸夸' },
  { key: 'plain', label: '平实日常' },
  { key: 'business', label: '商务理性' },
  { key: 'humor', label: '幽默一点' },
  { key: 'safe', label: '保守稳妥（不踩雷）' },
]

const AiReviewPage = () => {
    const [keyword, setKeyword] = useState('')
    const [images,setImages] = useState<string[]>([])
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [limit, setLimit] = useState(100)
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(false)
    // 上传图片、拍照
    const handleUpload = async () => {
        const res = await Taro.chooseImage({
            count: 1,
            success: (res) => {
                // setImages(res.tempFilePaths)
                Taro.uploadFile({
                  url:BASE_URL+'/api/comment/image',
                  filePath:res.tempFilePaths[0],
                  name:'file',
                  success:(res) => {
                    console.log('上传成功',res)
                    const result = JSON.parse(res.data)
                    if(result && result.data && result.data.url) {
                        setImages([...images,result.data.url])
                    }
                  }
                })
            }
        })
    }
    const buildReview = async () => {
        try {
            setLoading(true)
        
            const response = await httpPost('/api/comment/image', {
                words: limit,
                tone: toneLabel,
                keyword: keyword,
                images: images
            })
            
            setResult(response.text)
        } catch (error) {
            console.error('生成失败', error)
            Taro.showToast({ title: '生成失败，请重试', icon: 'none' })
        } finally {
            setLoading(false)
        }
    }
    const handleInput = debounce((value: string) => {
        setKeyword(value)
    }, 500)
    const handleToggleOption = (key: string) => {
        setSelectedOptions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    }
    const toneLabel = useMemo(() => {
        const toneOptions = TONE_OPTION_TAGS.filter(tag => selectedOptions.includes(tag.key))
        return toneOptions.map(tag => tag.label).join('、') || ''
    }, [selectedOptions])
  return (
    <View className='ai-page'>
      {/* 背景光斑 */}
      <View className='ai-bg-circle ai-bg-circle--top' />
      <View className='ai-bg-circle ai-bg-circle--bottom' />

      {/* 主体滚动区域 */}
      <ScrollView scrollY className='ai-main'>

        {/* 关键词区域 */}
        <View className='ai-section'>
          <View className='ai-section__title-row'>
            <Text className='ai-section__title'>关键词</Text>
            <Text className='ai-chip ai-chip--primary'>专业模式</Text>
          </View>

       <View className='ai-card ai-card--textarea'>
  <View className='ai-card__body'>
    <Text className='ai-label'>评价细节</Text>

    {/* 横向图片列表 + 添加按钮 */}
    <ScrollView
      scrollX
      className='ai-image-list'
      showScrollbar={false}
    >
      {images.map((url, index) => (
        <View className='ai-image-list__inner' key={index}>
          <View className='ai-image ai-image--large'>
            <Image
              className='ai-image__img'
              src={url}
              mode='aspectFill'
            />
            <View 
              className='ai-image__close ai-image__close--round'
              onClick={() => setImages(images.filter((_, i) => i !== index))}
            >
              <Text className='ai-image__close-text'>×</Text>
            </View>
          </View>
        </View>
      ))}
      
      {/* 添加图片按钮 */}
      <View className='ai-image-add' onClick={handleUpload}>
        <Image 
          className='ai-image-add__icon' 
          src='https://ai-comment-1303796882.cos.ap-shanghai.myqcloud.com/uploads/1769071844937-356dd2c701e09.png' 
          mode='aspectFill' 
        />
      </View>
    </ScrollView>

    {/* 文本框 */}
    <Textarea
      placeholder='ai图片分析已开启(可选):可在此继续输入菜名、口味等具体细节，比如"番茄炒蛋"，"米其林"，"川菜"'
    
      className='ai-textarea'
      maxlength={50}
      showConfirmBar={false}
      value={keyword}
      onInput={(e) => handleInput(e.detail.value)}
    />
   <Text className='ai-counter'>{keyword.length}/50</Text>
  </View>

 
</View>


          {/* 语气选项 */}
        
                 <View className='options'>
                {TONE_OPTION_TAGS.map(opt => (
                  <View
                    key={opt.key}
                    className={`option-tag ${selectedOptions.includes(opt.key) ? 'checked' : ''}`}
                    onClick={() => handleToggleOption(opt.key)}
                  >
                    <Text>{opt.label}</Text>
                  </View>
                ))}
              </View> 
        </View>

        {/* 生成结果 */}
        <View className='ai-result'>
          <View className='ai-result__title-row'>
            <Text className='ai-result__label'>生成结果</Text>
            <View className='ai-result__line' />
          </View>

          <View className='ai-result__box'>
            {loading ? (
              <View className='ai-result__loading'>
                <Text className='ai-result__loading-text'>生成中...</Text>
              </View>
            ) : result ? (
              <Textarea
                className='ai-result__textarea'
                value={result}
                placeholder='生成的好评将显示在这里'
                maxlength={300}
                showConfirmBar={false}
                autoHeight
                readOnly
              />
            ) : (
              <View className='ai-result__empty'>
                <View className='ai-result__empty-icon'>✨</View>
                <Text className='ai-result__empty-text'>
                  生成的好评将显示在这里。
                  {'\n'}
                  准备好给别人留下深刻印象了吗？
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 底部主按钮 */}
        <View className='footer'>
          <Button className='generate-btn' onClick={buildReview}>生成好评</Button>
        </View>
    
    </View>
  )
}

export default AiReviewPage