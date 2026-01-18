export interface ICategory {
    id: number
    name: string
    parentId?: number | null,
    children?: ICategory[] | null
    frequentlyUsed?: boolean
    // 可选的分组用于 UI 分类展示（如“异国料理”等）
    group?: string
}