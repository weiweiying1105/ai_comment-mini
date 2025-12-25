import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createJsonResponse, ResponseUtil } from '@/lib/response'

const selectFields = {
    id: true,
    name: true,
    parentId: true,
    keyword: true,
    icon: true,
    active_icon: true,
    use_count: true,
}

type CategoryNode = {
    id: number
    name: string
    parentId: number | null
    keyword: string | null
    icon: string | null
    active_icon: string | null
    use_count: number
    children: CategoryNode[]
}
function buildCategoryTree(items: { id: number; name: string; parentId: number | null; keyword: string | null; icon: string | null; active_icon: string | null; use_count: number }[]): CategoryNode[] {
    const nodeMap = new Map<number, CategoryNode>()
    const roots: CategoryNode[] = []

    // 初始化节点映射
    for (const it of items) {
        nodeMap.set(it.id, {
            id: it.id,
            name: it.name,
            parentId: it.parentId,
            keyword: it.keyword,
            icon: it.icon,
            active_icon: it.active_icon,
            use_count: it.use_count,
            children: []
        })
    }

    // 建立父子关系
    for (const node of nodeMap.values()) {
        if (node.parentId == null) {
            roots.push(node)
        } else {
            const parent = nodeMap.get(node.parentId)
            if (parent) {
                parent.children.push(node)
            } else {
                // 父节点缺失，作为根节点返回，避免数据丢失
                roots.push(node)
            }
        }
    }

    return roots
}

export async function OPTIONS() {
    return createJsonResponse(ResponseUtil.success(null), { status: 204 })
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const keyword = searchParams.get('keyword') || undefined
        const top = searchParams.get('top')
        const parentIdParam = searchParams.get('parentId')
        const frequentlyUsed = searchParams.get('frequentlyUsed')

        // 按需过滤
        const where: any = {}
        if (keyword) where.keyword = keyword
        if (top) where.parentId = null
        if (parentIdParam) where.parentId = Number(parentIdParam)

        // Default ordering
        let orderBy = [{ parentId: 'asc' }, { id: 'asc' }]
        
        // If frequentlyUsed is true, sort by use_count descending
        if (frequentlyUsed === 'true') {
            orderBy = [{ use_count: 'desc' }, { id: 'asc' }]
            // Only show categories with use_count > 0
            where.use_count = { gt: 0 }
        }

        const categories = await prisma.category.findMany({
            where,
            select: selectFields,
            orderBy
        })

        // 如果存在 parentId/顶级/keyword 过滤或请求的是常用分类，则直接返回扁平列表
        if (keyword || top || parentIdParam || frequentlyUsed === 'true') {
            return createJsonResponse(
                ResponseUtil.success(categories, frequentlyUsed === 'true' ? '常用分类查询成功' : '分类查询成功（含keyword、icon、active_icon）')
            )
        }

        const tree = buildCategoryTree(categories as any)
        return createJsonResponse(
            ResponseUtil.success(tree, '分类树查询成功（含keyword、icon、active_icon）')
        )
    } catch (error: any) {
        return createJsonResponse(
            ResponseUtil.error(`分类查询失败: ${error?.message || String(error)}`),
            { status: 500 }
        )
    }
}
// 移除重复的 CategoryNode 接口定义