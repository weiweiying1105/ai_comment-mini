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
const BASE_URL = process.env.BASE_URL;

const DEFAULT_TIMEOUT = 30000
// Token刷新状态管理
let isRefreshing = false; // 是否正在刷新token
let refreshFailed = false; // 是否刷新token失败
let requestQueue: Array<() => void> = [];// 刷新token后重新请求的队列

// 封装的请求函数
const request = async <T = any>(config: RequestConfig): Promise<T> => {
    if (refreshFailed) {
        Taro.showToast({
            title: 'Token刷新失败',
            icon: 'none',
            duration: 2000
        })
    }

    // 每次请求动态读取最新 token
    let token = Taro.getStorageSync('token') || ''

    const header: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.header
    }

    if (token) {
        header.Authorization = `Bearer ${token}`
    } else {
        try {
            const res = await Taro.login()
            if (res.code) {
                const loginRes = await callLoginApi({
                    code: res.code
                } as any)
                if (loginRes && (loginRes as any)?.token) {
                    token = (loginRes as any).token
                    Taro.setStorageSync('token', token)
                    header.Authorization = `Bearer ${token}`
                }
            }
        } catch (error) {
            console.error('登录失败', error)
        }
    }

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

        if (statusCode === 401) {
            return handleTokenRefresh(config)
        }

        if (statusCode !== 200) {
            Taro.showToast({
                title: `HTTP ${statusCode}: 请求失败`,
                icon: 'none',
                duration: 2000
            })
        }

        const apiResponse = data as ApiResponse
        const { code, message, data: responseData } = apiResponse
        switch (code) {
            case ResponseCode.SUCCESS:
                return responseData

            case ResponseCode.TOKEN_EXPIRED:
                return handleTokenRefresh(config)

            case ResponseCode.UNAUTHORIZED:
            case ResponseCode.USER_NOT_FOUND:
                Taro.removeStorageSync('token')
                Taro.removeStorageSync('userInfo')
                refreshFailed = true;
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
            // no break

            case ResponseCode.FORBIDDEN:
                Taro.showToast({
                    title: message || '没有权限访问',
                    icon: 'none'
                })
            // no break

            case ResponseCode.NOT_FOUND:
                Taro.showToast({
                    title: message || '请求的资源不存在',
                    icon: 'none'
                })
            // no break

            case ResponseCode.INVALID_PARAMS:
                Taro.showToast({
                    title: message || '参数错误',
                    icon: 'none'
                })
            // no break

            case ResponseCode.SERVER_ERROR:
                Taro.showToast({
                    title: message || '服务器错误',
                    icon: 'none'
                })
            // no break

            default:
                if (code !== ResponseCode.SUCCESS) {
                    Taro.showToast({
                        title: message || '请求失败',
                        icon: 'none'
                    })
                }
                return responseData
        }
    } catch (error: any) {
        Taro.hideLoading()

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

    if (refreshFailed) {
        console.log('refreshFailed为true，直接拒绝请求')
        redirectToLogin()
        return Promise.reject(new Error('登录已过期')) as any
    }

    const oldToken = Taro.getStorageSync('token')
    console.log('获取到的oldToken:', oldToken)

    if (!oldToken) {
        console.log('没有oldToken，跳转登录页')
        redirectToLogin()
        return Promise.reject(new Error('未登录')) as any
    }

    console.log('当前isRefreshing状态:', isRefreshing)
    console.log('当前requestQueue长度:', requestQueue.length)

    if (isRefreshing) {
        console.log('isRefreshing为true，将请求加入队列')
        return new Promise<T>((resolve) => {
            console.log('刷新token中...，当前队列:', requestQueue)
            requestQueue.push(() => {
                console.log('队列中的请求开始执行')
                resolve(request(originalRequest))
            })
        })
    } else {
        console.log('isRefreshing为false，开始刷新token')
        isRefreshing = true

        try {
            // 调用刷新token接口（使用 Authorization 头）
            const refreshResponse = await Taro.request({
                url: `${BASE_URL}/api/auth/refresh`,
                method: 'POST',
                data: {},
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${oldToken}`
                }
            })

            if (refreshResponse.statusCode === 200 && (refreshResponse.data as any)?.data?.token) {
                const newToken = (refreshResponse.data as any).data.token
                Taro.setStorageSync('token', newToken);
                refreshFailed = false;
                requestQueue.forEach(callback => callback())
                requestQueue = []
                const newConfig = {
                    ...originalRequest,
                    header: {
                        ...originalRequest.header,
                        Authorization: `Bearer ${newToken}`
                    }
                }
                return request(newConfig)
            } else {
                Taro.showToast({
                    title: '刷新token失败',
                    icon: 'none'
                })
                return Promise.reject(new Error('刷新token失败')) as any
            }
        } catch (refreshError) {
            Taro.removeStorageSync('token')
            Taro.removeStorageSync('userInfo')
            refreshFailed = true;
            requestQueue.forEach(callback => callback())
            requestQueue = []
            redirectToLogin()
            throw refreshError
        } finally {
            isRefreshing = false
            console.log('finally块执行，重置isRefreshing为false')
        }
    }
}
const redirectToLogin = () => {
    const state = redirectToLogin as any
    // 防止重复跳转
    if (!state.redirecting) {
        state.redirecting = true

        Taro.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
        })

        setTimeout(() => {
            Taro.navigateTo({
                url: '/pages/login/index'
            })
            state.redirecting = false
        }, 1500)
    }
}

export default request

// 导出常用的请求方法
export const get = <T = any>(url: string, params?: any): Promise<T> => {
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

export const post = <T = any>(url: string, data?: any): Promise<T> => {
    const config: RequestConfig = {
        url,
        method: 'POST',
        data
    }
    return request<T>(config)
}

export const put = <T = any>(url: string, data?: any): Promise<T> => {
    const config: RequestConfig = {
        url,
        method: 'PUT',
        data
    }
    return request<T>(config)
}

export const del = <T = any>(url: string): Promise<T> => {
    const config: RequestConfig = {
        url,
        method: 'DELETE'
    }
    return request<T>(config)
}

// 导出响应码枚举
export { ResponseCode }