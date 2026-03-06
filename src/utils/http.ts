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
const BASE_URL = (process as any).env.BASE_URL;
console.log('@@@BASE_URL:', BASE_URL, (process as any).env.BASE_URL)
const DEFAULT_TIMEOUT = 30000
// Token刷新状态管理
let isRefreshing = false; // 是否正在刷新token
let refreshFailed = false; // 是否刷新token失败
let requestQueue: Array<() => void> = [];// 刷新token后重新请求的队列

// 封装的请求函数
const request = async <T = any>(config: RequestConfig): Promise<T> => {
    // 如果刷新token失败，直接拒绝
    if (false) {
        // 占位：历史 refreshFailed 逻辑保留在下方，不在此提前返回
    }

    // 每次请求动态读取最新 token，避免跨页后内存中的旧值
    let token = Taro.getStorageSync('token') || ''

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
                const loginRes = await callLoginApi(
                    res.code
                )
                if (loginRes && loginRes?.token) {
                    token = loginRes.token
                    Taro.setStorageSync('token', loginRes.token)
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
        // 处理HTTP状态码
        if (statusCode === 401) {
            return handleTokenRefresh(config)
        }

        if (statusCode !== 200) {
            // 非 200 的 HTTP 状态，显示错误信息
            const errorMessage = `HTTP错误: ${statusCode}`
            Taro.showToast({
                title: errorMessage,
                icon: 'none',
                duration: 2000
            })
            throw new Error(errorMessage)
        }

        // 处理业务状态码
        const apiResponse = data as ApiResponse
        const { code, message, data: responseData } = apiResponse
        console.log('请求成功，返回apiResponse:', statusCode, 'code:', code, 'message:', message, 'data:', responseData)

        switch (code) {
            case ResponseCode.SUCCESS:
                return responseData

            case ResponseCode.TOKEN_EXPIRED:// token过期，刷新token
                return handleTokenRefresh(config)

            case ResponseCode.UNAUTHORIZED:// 未授权，清除本地存储并跳转到登录页
            case ResponseCode.USER_NOT_FOUND:// 用户不存在，清除本地存储并跳转到登录页
                Taro.removeStorageSync('token')
                Taro.removeStorageSync('userInfo')
                refreshFailed = true; // 标记刷新失败
                const authErrorMsg = message || '登录已过期，请重新登录'
                Taro.showToast({
                    title: authErrorMsg,
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(() => {
                    Taro.navigateTo({
                        url: '/pages/login/index'
                    })
                }, 2000)
                throw new Error(authErrorMsg)

            case ResponseCode.FORBIDDEN:
                const forbiddenMsg = message || '没有权限访问'
                Taro.showToast({
                    title: forbiddenMsg,
                    icon: 'none',
                    duration: 2000
                })
                throw new Error(forbiddenMsg)

            case ResponseCode.NOT_FOUND:
                const notFoundMsg = message || '请求的资源不存在'
                Taro.showToast({
                    title: notFoundMsg,
                    icon: 'none',
                    duration: 2000
                })
                throw new Error(notFoundMsg)

            case ResponseCode.INVALID_PARAMS:
                const paramsErrorMsg = message || '参数错误'
                Taro.showToast({
                    title: paramsErrorMsg,
                    icon: 'none',
                    duration: 2000
                })
                throw new Error(paramsErrorMsg)

            case ResponseCode.SERVER_ERROR:
                const serverErrorMsg = message || '服务器错误'
                Taro.showToast({
                    title: serverErrorMsg,
                    icon: 'none',
                    duration: 2000
                })
                throw new Error(serverErrorMsg)

            default:
                if (code !== ResponseCode.SUCCESS) {
                    console.log('其他业务状态码:', code, 'message:', message)
                    const defaultErrorMsg = message || '请求失败'
                    Taro.showToast({
                        title: defaultErrorMsg,
                        icon: 'none',
                        duration: 2000
                    })
                    throw new Error(defaultErrorMsg)
                }
                return responseData
        }
    } catch (error: any) {
        Taro.hideLoading()

        // 网络错误处理
        if (error.errMsg) {
            Taro.showToast({
                title: '网络请求失败',
                icon: 'none',
                duration: 2000
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
            requestQueue.push(() => {
                console.log('队列中的请求开始执行')
                resolve(request(originalRequest))
            })
        })
    } else {
        console.log('isRefreshing为false，开始刷新token')
        isRefreshing = true

        try {
            const refreshResponse = await Taro.request({
                url: `${BASE_URL}/api/auth/refresh`,
                method: 'POST',
                data: {},
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${oldToken}`
                }
            })

            if (refreshResponse.statusCode === 200 && refreshResponse.data?.data?.token) {
                const newToken = refreshResponse.data.data.token
                Taro.setStorageSync('token', newToken);
                refreshFailed = false; // 刷新成功，重置失败标记
                requestQueue.forEach(callback => callback())
                requestQueue = [] // 清空队列
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
            refreshFailed = true; // 标记刷新失败
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
    // 防止重复跳转
    if (!redirectToLogin.redirecting) {
        redirectToLogin.redirecting = true

        Taro.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
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