import { FC, useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Button, ScrollView, Image, Textarea, Slider } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { httpGet, httpPut, httpPost } from '@/utils/http'
import './index.scss'

interface GoodComment {
    id?: number
    category: number
    categoryName: string
    content: string
    createdAt?: string
    isTemplate?: boolean
}

const Templates: FC = () => {
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState<string>('全部')
    const [templates, setTemplates] = useState<GoodComment[]>([])
    
    // 模态框状态
    const [showModal, setShowModal] = useState(false)
    const [currentTemplate, setCurrentTemplate] = useState<GoodComment | null>(null)
    const [regenerateResult, setRegenerateResult] = useState('')
    const [regenerateLoading, setRegenerateLoading] = useState(false)
    const [limit, setLimit] = useState(150)
    
    const OPTION_TAGS = [
      { key: 'warm', label: '语气更热情' },
      { key: 'photo', label: '提到拍照好看' },
      { key: 'value', label: '强调性价比' },
    ]
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await httpGet<{ records: GoodComment[] }>('/api/comment?template=true')
                setTemplates(Array.isArray(data?.records) ? data.records : [])
            } catch (e) {
                console.error('加载模板失败', e)
            }
        }
        load()
    }, [])

    const categories = useMemo(() => {
        const set = new Set<string>()
        templates.forEach(r => { if (r.categoryName) set.add(r.categoryName) })
        return ['全部', ...Array.from(set)]
    }, [templates])

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        return templates.filter(r => {
            const matchCat = activeFilter === '全部' || r.categoryName === activeFilter
            const text = `${r.categoryName || ''} ${r.content || ''}`.toLowerCase()
            const matchSearch = keyword ? text.includes(keyword) : true
            return matchCat && matchSearch
        })
    }, [templates, search, activeFilter])

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

    // 取消收藏模板
    const handleUnsetTemplate = async (id: number) => {
        try {
            await httpPut('/api/comment', { id, isTemplate: false })
            Taro.showToast({ title: '已取消收藏', icon: 'success' })
            // 更新本地模板列表
            setTemplates(prev => prev.filter(t => t.id !== id))
        } catch (e) {
            console.error('取消收藏失败', e)
            Taro.showToast({ title: '操作失败', icon: 'none' })
        }
    }
    
    // 处理重新生成按钮点击
    const handleRecreateClick = (template: GoodComment) => {
        setCurrentTemplate(template)
        setRegenerateResult('')
        setSelectedOptions([])
        setShowModal(true)
        handleRegenerate(template)
    }
    
    // 关闭模态框
    const handleCloseModal = () => {
        setShowModal(false)
        setCurrentTemplate(null)
        setRegenerateResult('')
        setSelectedOptions([])
    }
    
    // 处理选项切换
    const handleToggleOption = (key: string) => {
        setSelectedOptions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    }
    
    // 重新生成评论
    const handleRegenerate = async (template: GoodComment) => {
        if (!template) return
        
        try {
            setRegenerateLoading(true)
            
            const res = await httpPost('/api/comment', {
                words: limit,
                categoryName: template.categoryName,
                categoryId: template.category,
                reference: template.content,
            })
            
            setRegenerateResult(res.text)
            
        } catch (e) {
            console.error('重新生成失败', e)
            Taro.showToast({ title: '生成失败', icon: 'none' })
        } finally {
            setRegenerateLoading(false)
        }
    }
    
    // 复制重新生成的结果
    const handleCopyRegenerateResult = () => {
        if (!regenerateResult) return
        
        Taro.setClipboardData({ data: regenerateResult })
            .then(() => {
                Taro.showToast({ title: '已复制', icon: 'success' })
            })
            .catch(() => {
                Taro.showToast({ title: '复制失败', icon: 'none' })
            })
    }

    return (
      <>
        <View className='templates-page'>

            {/* Search + Filters */}
            <View className='search-wrap'>
                <View className='search-box'>
                    <View className='search-icon'>🔍</View>
                    <Input
                        className='search-input'
                        placeholder='搜索模板关键词...'
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
                            <View className='btn-group'>
                                <View className='copy-btn' onClick={() => handleCopy(r.content)}>
                                    <Image className='copy-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766493141/copy_1_g1g6uc.png"></Image>
                                    <Text className='copy-hint'>复制</Text>
                                </View>
                                 <View className='copy-btn' onClick={() => handleCopy(r.content)}>
                                    <Image className='copy-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766493141/copy_1_g1g6uc.png"></Image>
                                    <Text className='copy-hint'>取消收藏</Text>
                                </View>
                                 {/* <View className='copy-btn' onClick={() => handleCopy(r.content)}>
                                    <Image className='copy-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766493141/copy_1_g1g6uc.png"></Image>
                                    <Text className='copy-hint'>重新生成</Text>
                                </View> */}
                            </View>
                            <Button onClick={() => handleRecreateClick(r)} className='recreate-btn'>
                                生成类似内容
                            </Button>
                        </View>
                    </View>
                ))}

                {filtered.length === 0 && (
                    <View className='empty'>
                        <View className='empty-icon'>📝</View>
                        <Text className='empty-text'>暂无收藏的模板</Text>
                        <Text className='empty-hint'>可以在历史记录中将评论设置为模板</Text>
                    </View>
                )}
            </ScrollView>
        </View>
        
        {/* 重新生成模态框 */}
        {showModal && currentTemplate && (
            <View className='modal-overlay' onClick={handleCloseModal}>
                <View className='modal-content' onClick={(e) => e.stopPropagation()}>
                    {/* 模态框头部 */}
                    <View className='modal-header'>
                        <Text className='modal-title'>重新生成</Text>
                        <Button className='modal-close-btn' onClick={handleCloseModal}>
                            <Image className='modal-close-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766820858/close_1_bfrids.png"></Image>
                        </Button>
                    </View>
                    
                    {/* 字数限制 */}
                    <View className='modal-section'>
                        <View className='section-header'>
                            <View className='section-title'>字数限制</View>
                            <Text className='limit-highlight'>{limit}字左右</Text>
                        </View>
                        <Slider
                            min={50}
                            max={300}
                            step={1}
                            activeColor='#F9F506'
                            blockColor='#F9F506'
                            value={limit}
                            onChange={(e) => setLimit(Number(e.detail.value))}
                        />
                    </View>
                    
                    {/* 生成选项 */}
                    {/* <View className='modal-section'>
                        <View className='section-header'>
                            <View className='section-title'>生成选项</View>
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
                    </View> */}
                    
                    {/* 生成结果 */}
                    <View className='modal-section'>
                        <View className='section-header'>
                            <View className='section-title'>生成结果</View>
                            <View className='copy-btn' onClick={handleCopyRegenerateResult}>
                                <Image className='copy-icon' src="https://res.cloudinary.com/dc6wdjxld/image/upload/v1766493141/copy_1_g1g6uc.png"></Image>
                                <Text className='copy-hint'>复制</Text>
                            </View>
                        </View>
                        <View className='result-box'>
                            <Textarea
                                className='result-textarea'
                                value={regenerateResult}
                                placeholder='点击下方按钮，重新生成好评…'
                                maxlength={300}
                                showConfirmBar={false}
                                autoHeight
                            />
                        </View>
                    </View>
                    
                    {/* 操作按钮 */}
                    <View className='modal-footer'>
                        <Button className='generate-btn' onClick={handleCopyRegenerateResult} disabled={regenerateLoading}>
                            {/* {regenerateLoading ? '生成中...' : '✨ 重新生成'} */}
                            复制
                        </Button>
                    </View>
                </View>
            </View>
        )}</>
    )
}

export default Templates
