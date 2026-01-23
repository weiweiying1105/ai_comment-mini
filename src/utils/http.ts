import Taro from '@tarojs/taro'
import { callLoginApi } from '@/api/index'

// 定义响应数据接口
interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}

// 定义请求配置接口
interface RequestConfig {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    header?: Record<string, string>
    timeout?: number
}

// 状态码枚举
enum ResponseCode {
    SUCCESS = 200,
    UNAUTHORIZED = 401,// 未授权
    FORBIDDEN = 403, // 禁止访问
    NOT_FOUND = 404, // 资源不存在
    SERVER_ERROR = 500, // 服务器错误
    TOKEN_EXPIRED = 402, // token过期
    USER_NOT_FOUND = 1002, // 用户不存在
    INVALID_PARAMS = 400, // 参数错误
}

// 基础配置
const BASE_URL =  (process as any).env.BASE_URL;
console.log('@@@BASE_URL:', BASE_URL,(process as any).env.BASE_URL)
const DEFAULT_TIMEOUT = 30000
let token = Taro.getStorageSync('token') || ''
// Token刷新状态管理
let isRefreshing = false; // 是否正在刷新token
let refreshFailed = false; // 是否刷新token失败
let requestQueue: Array<() => void> = [];// 刷新token后重新请求的队列

// 封装的请求函数
const request = async <T = any>(config: RequestConfig): Promise<T> => {
    // 如果刷新token失败，直接拒绝
    if (refreshFailed) {
        throw new Error('Token刷新失败')
    }
    // 动态获取最新的token


    const header: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.header
    }

    if (token) {
        console.log('token:', token)
        header.Authorization = `Bearer ${token}`
    } else {
        try {
            const res = await Taro.login()
            if (res.code) {
                console.log('登录成功，获取到code:', res.code)
                const loginRes = await callLoginApi(
                    res.code
                )
                console.log('登录成功，获取到token:', loginRes.token)
                if (loginRes.token) {
                    token = loginRes.token
                    Taro.setStorageSync('token', loginRes.token)
                    // 获取到token后，更新请求头并继续发起请求
                    header.Authorization = `Bearer ${token}`
                }
            }
        } catch (error) {
            console.error('登录失败', error)
        }
    }

    // 显示加载提示
    Taro.showLoading({
        title: '加载中...',
        mask: true
    })

    try {
        const response = await Taro.request({
            url: `${BASE_URL}${config.url}`,
            method: config.method || 'GET',
            data: config.data,
            header,
            timeout: config.timeout || DEFAULT_TIMEOUT
        })

        Taro.hideLoading()

        const { statusCode, data } = response
        console.log('请求成功，返回response:', statusCode, 'data:', data)
        // 处理HTTP状态码
        if (statusCode === 401) {
            return handleTokenRefresh(config)
        }

        if (statusCode !== 200) {
            throw new Error(`HTTP ${statusCode}: 请求失败`)
        }

        // 处理业务状态码
        const apiResponse = data as ApiResponse
        const { code, message, data: responseData } = apiResponse
        // console.log('请求成功，返回apiResponse:', statusCode, 'code:', code, 'message:', message, 'data:', responseData)
        // debugger
        switch (code) {
            case ResponseCode.SUCCESS:
                return responseData

            case ResponseCode.TOKEN_EXPIRED:// token过期，刷新token
                return handleTokenRefresh(config)

            case ResponseCode.UNAUTHORIZED:// 未授权，清除本地存储并跳转到登录页
            case ResponseCode.USER_NOT_FOUND:// 用户不存在，清除本地存储并跳转到登录页
                // token过期或未授权或用户不存在，清除本地存储并跳转到登录页
                Taro.removeStorageSync('token')
                Taro.removeStorageSync('userInfo')
                refreshFailed = true; // 标记刷新失败
                Taro.showToast({
                    title: message || '登录已过期，请重新登录',
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(() => {
                    Taro.navigateTo({
                        url: '/pages/login/index'
                    })
                }, 2000)
                throw new Error(message || '登录已过期')

            case ResponseCode.FORBIDDEN:
                Taro.showToast({
                    title: message || '没有权限访问',
                    icon: 'none'
                })
                throw new Error(message || '没有权限访问')

            case ResponseCode.NOT_FOUND:
                Taro.showToast({
                    title: message || '请求的资源不存在',
                    icon: 'none'
                })
                throw new Error(message || '请求的资源不存在')

            case ResponseCode.INVALID_PARAMS:
                Taro.showToast({
                    title: message || '参数错误',
                    icon: 'none'
                })
                throw new Error(message || '参数错误')

            case ResponseCode.SERVER_ERROR:
                Taro.showToast({
                    title: message || '服务器错误',
                    icon: 'none'
                })
                throw new Error(message || '服务器错误')

            default:
                if (code !== ResponseCode.SUCCESS) {
                    Taro.showToast({
                        title: message || '请求失败',
                        icon: 'none'
                    })
                    throw new Error(message || '请求失败')
                }
                return responseData
        }
    } catch (error: any) {
        Taro.hideLoading()

        // 网络错误处理
        if (error.errMsg) {
            Taro.showToast({
                title: '网络请求失败',
                icon: 'none'
            })
        }

        throw error
    }
}

// token刷新处理
const handleTokenRefresh = async <T = any>(originalRequest: RequestConfig): Promise<T> => {
    console.log('进入handleTokenRefresh函数')

    // 如果刷新token失败，直接拒绝请求
    if (refreshFailed) {
        console.log('refreshFailed为true，直接拒绝请求')
        throw new Error('登录已过期，请重新登录')
    }

    const oldToken = Taro.getStorageSync('token')
    console.log('获取到的oldToken:', oldToken)

    if (!oldToken) {
        // 没有token，跳转登录
        console.log('没有oldToken，跳转登录页')
        // debugger
        redirectToLogin()
        throw new Error('请先登录')
    }

    console.log('当前isRefreshing状态:', isRefreshing)
    console.log('当前requestQueue长度:', requestQueue.length)

    if (isRefreshing) {
        console.log('isRefreshing为true，将请求加入队列')
        return new Promise<T>((resolve, reject) => {
            console.log('刷新token中...，当前队列:', requestQueue)
            // debugger;
            requestQueue.push(() => {
                console.log('队列中的请求开始执行')
                resolve(request(originalRequest))
            })
        })
    } else {
        console.log('isRefreshing为false，开始刷新token')
        isRefreshing = true

        try {
            // 调用刷新token接口
            const refreshResponse = await Taro.request({
                url: `${BASE_URL}/auth/refresh`,
                method: 'POST',
                data: { token: oldToken },
                header: { 'Content-Type': 'application/json' }
            })

            if (refreshResponse.statusCode === 200) {
                const newToken = refreshResponse.data.data.token
                Taro.setStorageSync('token', newToken);
                debugger;
                refreshFailed = false; // 刷新成功，重置失败标记
                // 重新发送队列中的所有请求
                requestQueue.forEach(callback => callback())
                requestQueue = [] // 清空队列
                // 重新发送原始请求
                const newConfig = {
                    ...originalRequest,
                    header: {
                        ...originalRequest.header,
                        Authorization: `Bearer ${newToken}`
                    }
                }
                return request(newConfig)
            } else {
                throw new Error('刷新token失败')
            }
        } catch (refreshError) {
            // 刷新失败，清除本地数据并跳转登录
            Taro.removeStorageSync('token')
            Taro.removeStorageSync('userInfo')
            refreshFailed = true; // 标记刷新失败
            requestQueue.forEach(callback => callback()) // // 执行队列中的请求，但它们会因为refreshFailed为true而失败
            requestQueue = [] // 清空队列
            redirectToLogin()
            throw refreshError
        } finally {
            // 无论成功失败，都重置刷新状态
            isRefreshing = false
            console.log('finally块执行，重置isRefreshing为false')
        }
    }
}
const redirectToLogin = () => {
    // 防止重复跳转
    if (!redirectToLogin.redirecting) {
        redirectToLogin.redirecting = true

        Taro.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
        })

        setTimeout(() => {
            Taro.navigateTo({
                url: '/pages/login/index'
            })
            redirectToLogin.redirecting = false
        }, 1500)
    }
}

// 为redirectToLogin函数添加静态属性
// @ts-ignore
redirectToLogin.redirecting = false

// 导出请求方法
export default request

// 导出常用的请求方法
export const httpGet = <T = any>(url: string, params?: any): Promise<T> => {
    let fullUrl = url
    if (params) {
        // 使用小程序兼容的方式拼接查询参数
        const queryParams = Object.keys(params).map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        }).join('&')
        fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`
    }
    const config: RequestConfig = {
        url: fullUrl,
        method: 'GET'
    }
    return request<T>(config)
}

export const httpPost = <T = any>(url: string, data?: any): Promise<T> => {
    const config: RequestConfig = {
        url,
        method: 'POST',
        data
    }
    return request<T>(config)
}

export const httpPut = <T = any>(url: string, data?: any): Promise<T> => {
    const config: RequestConfig = {
        url,
        method: 'PUT',
        data
    }
    return request<T>(config)
}

export const put = httpPut // 保留旧的函数名以保持兼容性

export const httpDelete = <T = any>(url: string): Promise<T> => {
    const config: RequestConfig = {
        url,
        method: 'DELETE'
    }
    return request<T>(config)
}

export const del = httpDelete // 保留旧的函数名以保持兼容性

// 导出响应码枚举
export { ResponseCode }