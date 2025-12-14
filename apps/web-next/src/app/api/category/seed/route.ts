import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { DP_CATEGORIES, Category } from '@/data/dpCategories'
import { ResponseUtil, createJsonResponse } from '@/lib/response'

async function upsertCategory(name: string, parentId: number | null) {
    const cat = await prisma.category.upsert({
        where: { name },
        update: { name, parentId: parentId ?? undefined },
        create: { name, parentId: parentId ?? undefined },
    })
    return cat
}

async function seedCategories(categories: Category[], parentId: number | null = null) {
    const results: { name: string; id: number }[] = []

    for (const cat of categories) {
        const created = await upsertCategory(cat.name, parentId)
        results.push({ name: created.name, id: created.id })

        if (cat.children && cat.children.length > 0) {
            const childResults = await seedCategories(cat.children, created.id)
            results.push(...childResults)
        }
    }

    return results
}

export async function POST(req: NextRequest) {
    try {
        const seeded = await seedCategories(DP_CATEGORIES, null)
        return createJsonResponse(
            ResponseUtil.success(
                { count: seeded.length, items: seeded },
                '分类已写入（幂等：按名称唯一Upsert）'
            )
        )
    } catch (error: any) {
        console.error('Seed categories error:', error)
        return createJsonResponse(ResponseUtil.error('分类导入失败'), { status: 500 })
    }
}

export async function OPTIONS() {
    return createJsonResponse(ResponseUtil.success(null), { status: 204 })
}