import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createJsonResponse, ResponseUtil } from '@/lib/response'

type CategoryNode = {
    id: number
    name: string
    parentId: number | null
    children: CategoryNode[]
}
function buildCategoryTree(items: { id: number; name: string; parentId: number | null }[]): CategoryNode[] {
    const nodeMap = new Map<number, CategoryNode>()
    const roots: CategoryNode[] = []

    // 初始化节点映射
    for (const it of items) {
        nodeMap.set(it.id, {
            id: it.id,
            name: it.name,
            parentId: it.parentId,
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
        const categories = await prisma.category.findMany({
            select: { id: true, name: true, parentId: true },
            orderBy: [{ parentId: 'asc' }, { id: 'asc' }]
        })
        console.log(categories)

        const tree = buildCategoryTree(categories)
        return createJsonResponse(
            ResponseUtil.success(tree, '分类树查询成功')
        )
    } catch (error: any) {
        return createJsonResponse(
            ResponseUtil.error(`分类查询失败: ${error?.message || String(error)}`),
            { status: 500 }
        )
    }
}