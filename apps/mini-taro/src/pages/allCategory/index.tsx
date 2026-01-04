import { FC, useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import './index.scss'
import Taro, { useDidShow } from '@tarojs/taro';
import { httpGet } from '@/utils/http'
import { ICategory } from '../../../typings';


const AllCategory: FC = () => {
  const [parent, setParent] = useState<ICategory['id']>();
  const [selectChild, setSelectChild] = useState<ICategory | null>(null)
  const [hasUserSelected, setHasUserSelected] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryList, setCategoryList] = useState<ICategory[]>([])


// useEffect(() => {
//   if(Taro.getStorageSync('selectChild') && Taro.getStorageSync('selectChild').id){
//     setSelectChild(Taro.getStorageSync('selectChild'))
//   }
// })

useEffect(() => {
  httpGet('/api/category').then(res => {
    setParent(res[0]?.id)
    setCategoryList(res|| [])
  })
}, [])
// 加载时读取缓存，作为初始高亮，不触发返回
useEffect(() => {
  const cached = Taro.getStorageSync('selectChild') as ICategory | undefined
  if (cached && cached.id) {
    setSelectChild(cached)
  }
}, [])
  // 左边的一级分类
  const parentList = useMemo(() => {
    return categoryList.filter(x => !x.parentId)
  }, [categoryList])

  const secondList = useMemo(() => {
    // console.log(parent,categoryList)
    return categoryList.find(x => x.id === parent)?.children || []
  }, [categoryList, parent])

  // 监听二级分类选中
  useEffect(() => {
    if (!hasUserSelected) return
    if (!selectChild || !selectChild.id) return
    // 通过事件通道把选中的子分类回传给上一页
    const ec = Taro.getCurrentInstance().page?.getOpenerEventChannel?.()
    ec?.emit('selectChild:update', { ...selectChild })
    // 返回上一页
    Taro.navigateBack({
      delta: 1,
    })
  }, [hasUserSelected, selectChild?.id])
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
                <Button
                  key={c.id}
                  className={`chip ${c.id === selectChild?.id ? 'active' : ''}`}
                  onClick={() => { setSelectChild({ ...c }); setHasUserSelected(true); }}
                >
                  {c.name}
                </Button>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AllCategory