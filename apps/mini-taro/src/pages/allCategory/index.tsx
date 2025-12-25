import { FC, useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import './index.scss'
import { useDidShow } from '@tarojs/taro'
import { get } from '@/utils/request'
import { httpGet } from '@/utils/http'
import { ICategory } from '../../../typings'


const AllCategory: FC = () => {
  const [parent, setParent] = useState<ICategory['id']>()
  const [search, setSearch] = useState('')
  const [categoryList, setCategoryList] = useState<ICategory[]>([])


useEffect(() => {
  httpGet('/api/category').then(res => {
    setParent(res[0]?.id)
    setCategoryList(res|| [])
  })
}, [])
  // 左边的一级分类
  const parentList = useMemo(() => {
    return categoryList.filter(x => !x.parentId)
  }, [categoryList])

  const secondList = useMemo(() => {
    // console.log(parent,categoryList)
    return categoryList.find(x => x.id === parent)?.children || []
  }, [categoryList, parent])

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
          {parentList.map(p => (
            <Button
              key={p.id}
              className={`parent-btn ${parent === p.id ? 'active' : ''}`}
              onClick={() => setParent(p.id)}
            >
              <Text className={`parent-text ${parent === p.id ? 'active' : ''}`}>{p.name}</Text>
            </Button>
          ))}
        </View>

        {/* 右侧内容 */}
        <View className='content'>
          {/* 热门分类 */}
          {/* <View className='section'>
            <View className='section-title'>🔥 热门分类</View>
            <View className='chips'>
              {HOT.map((c, i) => (
                <Button key={i} className={`chip ${c === '火锅' ? 'active' : ''}`}>{c}</Button>
              ))}
            </View>
          </View> */}

          {/* 异国料理 */}
          {/* <View className='section'>
            <View className='section-title'>🍽️ 异国料理</View>
            <View className='chips'>
              {EXOTIC.map((c, i) => (
                <Button key={i} className='chip'>{c}</Button>
              ))}
            </View>
          </View> */}
          {/* {secondList.length} */}
          {/* 当前父类的子分类 */}
          <View className='section'>
            <View className='section-title'>分类</View>
            <View className='chips'>
              {secondList.map((c, i) => (
                <Button key={c.id} className={`chip ${c.id === parent ? 'active' : ''}`}>{c.name}</Button>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AllCategory