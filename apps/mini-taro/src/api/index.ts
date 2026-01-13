import Taro from "@tarojs/taro"

// code 换 openid
export async function callLoginApi(code: string) {
    // 直接使用Taro.request而不是封装的post方法，避免循环调用
    const BASE_URL = (typeof process !== 'undefined' && (process as any).env && (process as any).env.BASE_URL)
        ? (process as any).env.BASE_URL
        : 'http://localhost:3000/app2'
    try {
        const response = await Taro.request({
            url: `${BASE_URL}/api/auth/login`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                code
            }
        })

        if (response.statusCode === 200) {
            return response.data.data
        } else {
            throw new Error(`登录失败: ${response.data?.message || '未知错误'}`)
        }
    } catch (error: any) {
        console.error('登录API调用失败:', error)
        throw new Error(error.message || '登录失败')
    }
}