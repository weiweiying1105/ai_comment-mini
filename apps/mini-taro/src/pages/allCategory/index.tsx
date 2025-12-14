import { FC, useMemo, useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import './index.scss'

const PARENTS = [
  { key: 'food', label: '美食' },
  { key: 'entertain', label: '休闲娱乐' },
  { key: 'beauty', label: '丽人' },
  { key: 'wedding', label: '结婚' },
  { key: 'parenting', label: '亲子' },
  { key: 'fitness', label: '运动健身' },
  { key: 'hotel', label: '酒店' },
  { key: 'travel', label: '周边游' },
  { key: 'home', label: '家装' },
  { key: 'education', label: '学习培训' },
]

const HOT = ['火锅', '自助餐', '烧烤', '快餐简餐']
const EXOTIC = ['日本料理', '韩式料理', '西餐', '东南亚']

const ALL: Record<string, string[]> = {
  food: ['火锅', '烧烤', '自助餐', '快餐简餐', '中餐', '甜点饮品'],
  entertain: ['KTV', '电影院', '桌游/棋牌', '密室逃脱'],
  beauty: ['美发', '美甲美睫', '美容/SPA'],
  wedding: ['婚纱摄影', '婚礼策划', '婚宴酒店'],
  parenting: ['亲子乐园', '早教/幼教', '亲子摄影'],
  fitness: ['健身房', '游泳馆', '瑜伽'],
  hotel: ['酒店', '民宿'],
  travel: ['景点乐园', '交通服务'],
  home: ['装修设计', '家具建材', '家居家纺'],
  education: ['语言培训', '艺术培训', 'K12辅导']
}

const AllCategory: FC = () => {
  const [parent, setParent] = useState('food')
  const [search, setSearch] = useState('')

  const subList = useMemo(() => {
    const list = ALL[parent] || []
    const q = search.trim().toLowerCase()
    return q ? list.filter(x => x.toLowerCase().includes(q)) : list
  }, [parent, search])

  return (
    <View className='all-category-page'>
      {/* 搜索框 */}
      <View className='search-wrap'>
        <View className='search-box'>
          <View className='search-icon'>🔍</View>
          <Input
            className='search-input'
            placeholder='搜索分类，如：火锅、美甲'
            value={search}
            onInput={(e) => setSearch(String(e.detail.value))}
          />
        </View>
      </View>

      <View className='split-layout'>
        {/* 左侧父类列表 */}
        <View className='sidebar'>
          {PARENTS.map(p => (
            <Button
              key={p.key}
              className={`parent-btn ${parent === p.key ? 'active' : ''}`}
              onClick={() => setParent(p.key)}
            >
              <Text className={`parent-text ${parent === p.key ? 'active' : ''}`}>{p.label}</Text>
            </Button>
          ))}
        </View>

        {/* 右侧内容 */}
        <View className='content'>
          {/* 热门分类 */}
          <View className='section'>
            <View className='section-title'>🔥 热门分类</View>
            <View className='chips'>
              {HOT.map((c, i) => (
                <Button key={i} className={`chip ${c === '火锅' ? 'active' : ''}`}>{c}</Button>
              ))}
            </View>
          </View>

          {/* 异国料理 */}
          <View className='section'>
            <View className='section-title'>🍽️ 异国料理</View>
            <View className='chips'>
              {EXOTIC.map((c, i) => (
                <Button key={i} className='chip'>{c}</Button>
              ))}
            </View>
          </View>

          {/* 当前父类的子分类 */}
          <View className='section'>
            <View className='section-title'>分类</View>
            <View className='chips'>
              {subList.map((c, i) => (
                <Button key={i} className='chip'>{c}</Button>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AllCategory