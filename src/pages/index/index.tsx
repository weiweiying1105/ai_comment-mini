import { FC, useEffect, useMemo, useState } from 'react'
import { View, Text, Button, Slider, Textarea, Image, ScrollView } from '@tarojs/components'
import './index.scss'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { httpGet, httpPost } from '@/utils/http'
import { ICategory } from '../../../typings'
// 4B5563  unactive
// 111827  active
// 语气
const BASE_URL = (typeof process !== 'undefined' && (process as any).env && (process as any).env.BASE_URL)
        ? (process as any).env.BASE_URL
        : 'http://localhost:3000'
const TONE_OPTION_TAGS = [
  { key: 'sincere', label: '真诚推荐' },
  { key: 'hot', label: '热情夸夸' },
  { key: 'plain', label: '平实日常' },
  { key: 'business', label: '商务理性' },
  { key: 'humor', label: '幽默一点' },
{ key: 'safe', label: '保守稳妥（不踩雷）' },
]
const defaultCategory = [
  { id: 1, name: '美食' },
  { id: 2, name: '饮品' },
  { id: 3, name: '酒店' },
  { id: 4, name: '娱乐' },
  { id: 5, name: '美容' },
  { id: 6, name: '亲子' },
  { id: 7, name: '健身' },
]

const Profile: FC = () => {
  const [category, setCategory] = useState<number>()
  const [limit, setLimit] = useState(Number(Taro.getStorageSync('limit') || 50))
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [result, setResult] = useState('')

  const router = useRouter()


  const [selectedChild, setSelectedChild] = useState<ICategory | null>(Taro.getStorageSync('selectChild') || null)
  // 监听limit变化，存到本地
  useEffect(() => {
    Taro.setStorageSync('limit', limit)
  }, [limit])
  useEffect(() => {
    // console.log('selectedChild', selectedChild)
    if (selectedChild && selectedChild.id) {
      setSelectedChild(selectedChild)
      setCategory(selectedChild.parentId ? selectedChild.parentId : undefined)
      Taro.setStorageSync('selectChild', selectedChild)
    }

  }, [selectedChild ? selectedChild.id : undefined])

  const [categoryList, setCategoryList] = useState<ICategory[]>(defaultCategory)
  useEffect(() => {
    httpGet('/api/category').then(res => {
      // console.log(res)
      const result = res.slice(0, 7) as ICategory[];
      // console.log(result)
      setCategory(res && res[0] ? res[0].id : undefined)
      setCategoryList(result || [])
    })
  }, [])
  const handleToggleOption = (key: string) => {
    setSelectedOptions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }
  const toneLabel = useMemo(() => {
    const toneOptions = TONE_OPTION_TAGS.filter(tag => selectedOptions.includes(tag.key))
    return toneOptions.map(tag => tag.label).join('、') || ''
  }, [selectedOptions])

  const hintText = useMemo(() => {
    return '点击下方按钮，可一键生成好评'
  }, [])

  const [keyword, setKeyword] = useState('')
  const [images,setImages] = useState<string[]>([])
  
  const handleUpload = async () => {
    const res = await Taro.chooseImage({
      count: 1,
      success: (res) => {
        Taro.uploadFile({
          url:BASE_URL+'/api/upload',
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
  
  const buildReview = () => {
    console.log('buildReview', selectedChild)
    const found = categoryList.find(c => c.id === category)
    const catLabel = found && found.name ? found.name : '美食'
    httpPost('/api/comment', {
      words: limit,
      categoryName: (selectedChild && selectedChild.name) ? selectedChild.name : catLabel,
      categoryId: (selectedChild && selectedChild.id) ? selectedChild.id : category,
      tone: toneLabel,
      keyword: keyword,
      images: images
    }).then(res => {
      console.log(res)
      setResult(res.text)
    })

  }
  const goAllCategory = () => {
    Taro.navigateTo({
      url: '/pages/allCategory/index',
      events: {
        'selectChild:update': (payload: ICategory) => {
          setSelectedChild(payload)
          setCategory(payload.parentId || payload.id)
        }
      }
    })
  }
  const handleCancelChild = () => {
    Taro.setStorageSync('selectChild', null)
    setSelectedChild(null)
  }
  const handleSelectCategory = (item: ICategory) => {
    setCategory(item.id);
    // 切换的时候清空选择的二级
    handleCancelChild()
  }
  return (
    <View className='profile-page'>
      <View className='section'>
        <View className='section-header'>
          <View className='section-title'>选择类别</View>
          <Text className='section-more' onClick={() => goAllCategory()}>查看更多</Text>
        </View>
        <View className='category-grid'>
          {categoryList.map(item => (
            <View
              key={item.id}
              className={`category-item ${category === item.id ? 'active' : ''}`}
              onClick={() => handleSelectCategory(item)}
            >
              <View className={`icon-circle ${category === item.id ? 'active' : ''}`}>
                <Image className='icon' src={(item as any).icon || ''} />
              </View>
              <Text className={`label ${category === item.id ? 'active' : ''}`}>{item.name}</Text>
            </View>
          ))}
          <View
            className="category-item"
            onClick={() => goAllCategory()}
          >
            <View className="icon-circle">
              <Image className='icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766648561/more_urb5kq.png" />
            </View>
            <Text className='label' >更多</Text>
          </View>
        </View>
        {/* 这里是二级分类 */}
        {selectedChild && selectedChild.name ? (
          <View className='second-tags'>
            <View className='chip'>
              <Text className='chip-label'>{selectedChild ? selectedChild.name : ''}</Text>
              <Button className='chip-close' onClick={() => handleCancelChild()}>
                <Image className='chip-close-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766820858/close_1_bfrids.png"></Image>
              </Button>
            </View>
          </View>
        ) : null}

        <View className='divider' />

        <View className='section'>
          <View className='section-header'>
            <View className='section-title'>字数限制</View>
            <Text className='limit-highlight'>{limit}字左右</Text>
          </View>
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

        <View className='section'>
          <View className='section-header'>
            <View className='section-title'>评价细节</View>
          </View>
          
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

          {/* 关键词输入 */}
          <View className='keyword-input'>
            <Text className='keyword-label'>关键词</Text>
            <Textarea
              className='keyword-textarea'
              placeholder='输入关键词，比如"番茄炒蛋"，"米其林"，"川菜"' 
              maxlength={50}
              showConfirmBar={false}
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
            />
            <Text className='keyword-counter'>{keyword.length}/50</Text>
          </View>
        </View>

        <View className='section'>
          <View className='section-header'>
            <View className='section-title'>生成结果</View>
            <View className='copy-btn'>
              <Image className='copy-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766493141/copy_1_g1g6uc.png"></Image>
              <Text className='copy-hint'>
                复制
              </Text>
            </View>

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

        <View className='footer'>
          <Button className='generate-btn' onClick={buildReview}>一键生成好评</Button>
        </View>
      </View>
    </View>

  )
}

export default Profile
