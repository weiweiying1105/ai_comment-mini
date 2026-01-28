// pages/ai-review/index.tsx
import { View, Text, ScrollView, Textarea, Image, Button, Slider } from '@tarojs/components'
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
  const [images, setImages] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [limit, setLimit] = useState(50)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const TOKEN = Taro.getStorageSync('token')
  const handleUpload = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const tempFilePath = res.tempFilePaths[0]

        Taro.showLoading({ title: '上传中...', mask: true })

        const uploadRes = await Taro.uploadFile({
          url: `${BASE_URL}/api/upload`,
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${TOKEN}`
          }
        })

        Taro.hideLoading()

        const data = JSON.parse(uploadRes.data)
        if (data.code === 200 && data.data && data.data.url) {
          setImages(prev => [...prev, data.data.url])
          // 把照片存到手机上
          Taro.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: () => {
              // Taro.showToast({ title: '图片已保存到相册', icon: 'success' })
            },
            fail: (err) => {
              Taro.showToast({ title: '保存图片失败', icon: 'none' })
              console.error('保存图片失败:', err)
            }
          })
          Taro.showToast({ title: '上传成功', icon: 'success' })
        } else {
          throw new Error(data.message || '上传失败')
        }
      }
    } catch (error: any) {
      Taro.hideLoading()
      console.error('上传失败:', error)
      Taro.showToast({ title: error.message || '上传失败，请重试', icon: 'none' })
    }
  }
  const buildReview = async () => {
    try {
      if (!keyword && !images.length) {
        Taro.showToast({ title: '请输入商品名称,或者上传商品图片', icon: 'none' ,duration: 5000})
        return
      }
      setLoading(true)

      const response = await httpPost('/api/comment/image', {
        words: limit,
        tone: toneLabel,
        keyword: keyword,
        images: images
      })
      console.log('生成结果:', response)

      setResult(response.comment || '')
    } catch (error) {
      console.error('生成失败', error)
      Taro.showToast({ title: '生成失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }
  const handleInput = debounce((value: string) => {
    setKeyword(value);
  }, 1000);
  const handleToggleOption = (key: string) => {
    setSelectedOptions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }
  const toneLabel = useMemo(() => {
    const toneOptions = TONE_OPTION_TAGS.filter(tag => selectedOptions.includes(tag.key))
    return toneOptions.map(tag => tag.label).join('、') || ''
  }, [selectedOptions])

  const handleCopy = () => {
    if (result) {
      Taro.setClipboardData({
        data: result,
        success: () => {
          Taro.showToast({ title: '复制成功', icon: 'success' ,duration:2000})
        }
      })
    }
  }
  return (
    <View className='ai-page'>
      {/* 背景光斑 */}
      <View className='ai-bg-circle ai-bg-circle--top' />
      <View className='ai-bg-circle ai-bg-circle--bottom' />

      {/* 主体滚动区域 */}
      <ScrollView scrollY className='ai-main'>

        {/* 字数限制 */}
        <View className=''>
          <View className='flex items-center justify-between mb-2'>
            <Text className='text-sm font-bold text-gray-700'>字数</Text>
            <Text className='text-sm font-bold text-primary-dark bg-primary-10 px-3 py-4 rounded-full'>{limit}字</Text>
          </View>
          <View className='slider-card'>
              <Slider
                min={50}
                max={300}
                step={10}
                activeColor='#ffd400'
                blockColor='#ffd400'
                value={limit}
                onChange={(e) => setLimit(Number(e.detail.value))}
              />
          </View>
        </View>

        {/* 关键词区域 */}
        <View className='ai-section'>
          <View className='ai-card ai-card--textarea'>
            <View className='ai-card__body'>
              <Text className='ai-label'>上传菜品细节图（可选）</Text>

              {/* 横向图片列表 + 添加按钮 */}
              <View
                className='ai-image-list'
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
                {images.length <= 3 && (
                  <View className='ai-image-add' onClick={handleUpload}>
                    <Image
                      className='ai-image-add__icon'
                      src='https://ai-comment-1303796882.cos.ap-shanghai.myqcloud.com/uploads/1769071844937-356dd2c701e09.png'
                      mode='aspectFill'
                    />
                  </View>)}

              </View>

              {/* 文本框 */}
              <Textarea
                placeholder='可在此继续输入菜名、口味等具体细节，比如"番茄炒蛋"，"米其林"，"川菜"'
                placeholderClass='ai-textarea__placeholder'
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
        <View className="ai-section ai-preview-section">
          {/* <View className="ai-preview-header">
            <Text className="ai-preview-title">预览</Text>
            <View className="ai-preview-divider"></View>
          </View> */}
          <View className={`ai-preview-content ${result ? 'ai-preview-content--filled' : 'ai-preview-content--empty'}`}>
            {result ? (
              <View className="ai-preview-text">{result}
              </View>
            ) : (
              <>
                <View className="ai-preview-icon">
                  <Text className="ai-preview-icon-text">✨</Text>
                </View>
                <Text className="ai-preview-placeholder">生成的好评将显示在这里。
                  准备好给别人留下深刻印象了吗？</Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 底部主按钮 */}
      <View className='footer'>
        <Button className='copy-btn' onClick={handleCopy}>
          <Image className='copy-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766493141/copy_1_g1g6uc.png"></Image>
        </Button>
        <Button className='generate-btn' onClick={buildReview}>生成好评</Button>
      </View>

    </View>
  )
}

export default AiReviewPage