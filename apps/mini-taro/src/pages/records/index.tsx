import { FC, useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Button, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { httpGet, httpPut } from '@/utils/http'
import './index.scss'

interface GoodComment {
    id?: number
    category: number
    categoryName: string
    content: string
    createdAt?: string
    isTemplate?: boolean
}

const Records: FC = () => {
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState<string>('全部')
    const [records, setRecords] = useState<GoodComment[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await httpGet<{ records: GoodComment[] }>('/api/comment')
                setRecords(Array.isArray(data?.records) ? data.records : [])
            } catch (e) {
                console.error('加载记录失败', e)
            }
        }
        load()
    }, [])

    const categories = useMemo(() => {
        const set = new Set<string>()
        records.forEach(r => { if (r.categoryName) set.add(r.categoryName) })
        return ['全部', ...Array.from(set)]
    }, [records])

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        return records.filter(r => {
            const matchCat = activeFilter === '全部' || r.categoryName === activeFilter
            const text = `${r.categoryName || ''} ${r.content || ''}`.toLowerCase()
            const matchSearch = keyword ? text.includes(keyword) : true
            return matchCat && matchSearch
        })
    }, [records, search, activeFilter])

    const formatDate = (s?: string) => {
        if (!s) return ''
        const d = new Date(s)
        if (isNaN(d.getTime())) return s
        const y = d.getFullYear()
        const m = `${d.getMonth() + 1}`.padStart(2, '0')
        const day = `${d.getDate()}`.padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const handleCopy = (text: string) => {
        Taro.setClipboardData({ data: text })
            .then(() => {
                Taro.showToast({ title: '已复制', icon: 'success' })
            })
            .catch(() => {
                Taro.showToast({ title: '复制失败', icon: 'none' })
            })
    }

    // 设置/取消收藏模板
    const handleSetTemplate = async (id: number, isTemplate: boolean) => {
        try {
            await httpPut('/api/comment',{id,isTemplate })
            Taro.showToast({ title: isTemplate ? '已取消收藏' : '已收藏', icon: 'success' })
        } catch (e) {
            console.error('设置收藏状态失败', e)
            Taro.showToast({ title: '操作失败', icon: 'none' })
        }
    }

    return (
        <View className='records-page'>

            {/* Search + Filters */}
            <View className='search-wrap'>
                <View className='search-box'>
                    <View className='search-icon'>🔍</View>
                    <Input
                        className='search-input'
                        placeholder='搜索历史好评关键词...'
                        value={search}
                        onInput={(e) => setSearch(String(e.detail.value))}
                    />
                </View>
                <ScrollView className='chips-row' scrollX>
                    <View className='chips-inner'>
                        {categories.map((c) => (
                            <Button
                                key={c}
                                className={`chip ${activeFilter === c ? 'active' : ''}`}
                                onClick={() => setActiveFilter(c)}
                            >
                                {c}
                            </Button>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* List */}
            <ScrollView className='list' scrollY>
                {filtered.map((r) => (
                    <View className='card' key={r.id ?? `${r.category}-${r.createdAt ?? r.content.slice(0, 20)}`}>
                        <View className='card-head'>
                            <Text className='tag'>{r.categoryName || '未分类'}</Text>
                            <Text className='date'>{formatDate(r.createdAt)}</Text>
                        </View>
                        <Text className='content'>{r.content}</Text>
                        <View className='card-actions'>
                            <View className='copy-btn' onClick={() => handleCopy(r.content)}>
                                <Image className='copy-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766493141/copy_1_g1g6uc.png"></Image>
                                <Text className='copy-hint'>复制</Text>
                            </View>
                            <Button onClick={() => handleSetTemplate(r.id , r.isTemplate)} className={`template-btn ${!r.isTemplate ? 'active' : ''}`}>
                                {r.isTemplate ? '取消模板' : '设置为模板'}
                            </Button>
                        </View>
                    </View>
                ))}

                {filtered.length === 0 && (
                    <View className='empty'>
                        <View className='empty-bar' />
                        <Text className='empty-text'>没有更多记录了</Text>
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            {/* <View className='fab-wrap'>
                <Button className='fab' onClick={() => Taro.navigateTo({ url: '/pages/index/index' })}>
                    <Text className='fab-icon'>＋</Text>
                </Button>
            </View> */}
        </View>
    )
}

export default Records