import { FC, useEffect, useMemo, useState } from 'react'
import { View, Text, Button, Slider, Textarea, Image } from '@tarojs/components'
import './index.scss'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { httpGet, httpPost } from '@/utils/http'
import { ICategory } from '../../../typings'
// 4B5563  unactive
// 111827  active

const OPTION_TAGS = [
  { key: 'warm', label: '语气更热情' },
  { key: 'photo', label: '提到拍照好看' },
  { key: 'value', label: '强调性价比' },
]

const Profile: FC = () => {
  const [category, setCategory] = useState<number>()
  const [limit, setLimit] = useState(150)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [result, setResult] = useState('')

  const router = useRouter()
  

  const [selectedChild, setSelectedChild] = useState<ICategory | null>(Taro.getStorageSync('selectChild') || null)
  useEffect(() => {
    // console.log('selectedChild', selectedChild)
    if(selectedChild&&selectedChild?.id){
      setSelectedChild(selectedChild)
      setCategory(selectedChild?.parentId || undefined)
      Taro.setStorageSync('selectChild', selectedChild)
    }
      
  },[selectedChild?.id])
 
  const [categoryList, setCategoryList] = useState<ICategory[]>([])
  useEffect(() => {
    httpGet('/api/category').then(res => {
      // console.log(res)
      const result = res.slice(0,7) as ICategory[];
      // console.log(result)
      setCategory(res[0]?.id || [])
      setCategoryList(result|| [])
    })
  },[])
  const handleToggleOption = (key: string) => {
    setSelectedOptions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }
  
  const hintText = useMemo(() => {
    return '点击下方按钮，生成在大众点评上的完美好评…'
  }, [])

  const buildReview = () => {
    console.log('buildReview', selectedChild)
    const catLabel = categoryList.find(c => c.id === category)?.name || '美食'
    httpPost('/api/comment', {
      words:limit,
      categoryName:selectedChild?.name || catLabel,
      categoryId:selectedChild?.id || category,
    }).then(res=>{
      console.log(res)
      setResult(res.text)
    })
  
  }
 const goAllCategory =()=>{
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
 const handleCancelChild = ()=>{
   Taro.setStorageSync('selectChild', null)
   setSelectedChild(null)
 }
  return (
    <View className='profile-page'>
      <View className='section'>
        <View className='section-header'>
          <View className='section-title'>选择类别</View>
          <Text className='section-more' onClick={()=>goAllCategory()}>查看更多</Text>
        </View>
        <View className='category-grid'>
          {categoryList.map(item => (
            <View
              key={item.id}
              className={`category-item ${category === item.id ? 'active' : ''}`}
              onClick={() => setCategory(item.id)}
            >
              <View className={`icon-circle ${category === item.id ? 'active' : ''}`}>
                <Image className='icon' src={(item as any).icon || ''} />
              </View>
              <Text className={`label ${category === item.id ? 'active' : ''}`}>{item.name}</Text>
            </View>
          ))}
            <View
              className="category-item"
              onClick={()=>goAllCategory()}
            >
              <View className="icon-circle">
                <Image className='icon' src= "https://res.cloudinary.com/dc6wdjxld/image/upload/v1766648561/more_urb5kq.png"/>
              </View>
              <Text className='label' >更多</Text>
            </View>
        </View>
        {/* 这里是二级分类 */}
       {selectedChild&&selectedChild?.name ? ( 
        <View className='second-tags'>
            <View className='chip'>
             <Text className='chip-label'>{selectedChild?.name}</Text>
             <Button className='chip-close' onClick={()=>handleCancelChild()}>
              <Image className='chip-close-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766820858/close_1_bfrids.png"></Image>
             </Button>
            </View>
          </View>
       ):null}

      <View className='divider' />

      <View className='section'>
        <View className='section-header'>
          <View className='section-title'>字数限制</View>
          <Text className='limit-highlight'>{limit}字左右</Text>
        </View>
        <Slider
          min={50}
          max={300}
          step={1}
          activeColor='rgb(249 245 6)'
          blockColor='rgb(249 245 6)'
          value={limit}
          onChange={(e) => setLimit(Number(e.detail.value))}
          
        />
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
      </View>
      
    )
  }

  export default Profile
