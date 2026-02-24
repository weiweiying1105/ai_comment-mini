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


  useEffect(() => {
    httpGet('/api/category').then(res => {
      // setParent(res[0]?.id)
      setParent(res && res[0] ? res[0].id : undefined)
      setCategoryList(res || [])
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
    // return categoryList.find(x => x.id === parent)?.children || []
    const found = categoryList.find(x => x.id === parent)
    return found && found.children ? found.children : []
  }, [categoryList, parent])

  // 监听二级分类选中
// 修改建议
useEffect(() => {
  // 只在用户明确选择且有子分类时执行
  if (!hasUserSelected || !selectChild || !selectChild.id) return
  
  // 立即设置标志，防止重复执行
  setHasUserSelected(false)
  
  // 使用setTimeout确保状态更新完成后再执行导航
  setTimeout(() => {
    try {
      // 通过事件通道把选中的子分类回传给上一页
      const inst = Taro.getCurrentInstance()
      const ec = inst?.page?.getOpenerEventChannel?.()
      
      if (ec) {
        ec.emit('selectChild:update', { ...selectChild })
      }
      
      // 返回上一页
      Taro.navigateBack({
        delta: 1,
      })
    } catch (error) {
      console.error('导航回退失败:', error)
    }
  }, 0)
}, [hasUserSelected, selectChild]) // 简化依赖数组
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
                  className={`chip ${c.id === (selectChild ? selectChild.id : undefined) ? 'active' : ''}`}
                  onClick={() => { setSelectChild({ ...c }); setHasUserSelected(true); }}
                >
                  {c.name}
                  {/* 打上常用标签 */}
                  {c.frequentlyUsed ? (
                    <Text className='frequent-tag'>常用</Text>
                  ) : null}
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