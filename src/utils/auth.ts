import Taro, { getCurrentPages } from "@tarojs/taro"
import { httpGet } from "./http"
interface EnsureOptions {
    needPhone?: boolean  // 是否必须要有手机号
    revalidateInterval?: number // 多久跟后端校验一次，默认 5 分钟
}
type IAppOption = {
    globalData: {
        userInfo?: any
        lastUserInfoCheckTime?: number
    }
}
// utils/auth.ts
const USER_INFO_KEY = 'USER_INFO'
// 移除模块级 TOKEN 常量，改为按需读取 Storage
export function setUserInfo(userInfo: any) {
    const app = Taro.getApp<IAppOption>()
    console.log('setUserInfo', app)
    const now = Date.now()

    if (app) {
        if (!app.globalData) {
            app.globalData = {}
        }
        app.globalData.userInfo = userInfo
        app.globalData.lastUserInfoCheckTime = now
    }

    Taro.setStorageSync(USER_INFO_KEY, {
        userInfo,
        lastUserInfoCheckTime: now,
    })
}
// 从内存 / 缓存中拿当前状态
export function getUserInfoCached() {
    const app = Taro.getApp<IAppOption>()
    
    if (!app) {
        const cache = Taro.getStorageSync(USER_INFO_KEY)
        if (cache) {
            return cache
        }
        return { userInfo: null, lastUserInfoCheckTime: 0 }
    }
    
    if (!app.globalData) {
        app.globalData = {
            userInfo: null,
            lastUserInfoCheckTime: 0
        }
    }
    
    if (app.globalData.userInfo) {
        return {
            userInfo: app.globalData.userInfo,
            lastUserInfoCheckTime: app.globalData.lastUserInfoCheckTime || 0,
        }
    }

    const cache = Taro.getStorageSync(USER_INFO_KEY)
    if (cache) {
        app.globalData.userInfo = cache.userInfo
        app.globalData.lastUserInfoCheckTime = cache.lastUserInfoCheckTime || 0
        return cache
    }

    return { userInfo: null, lastUserInfoCheckTime: 0 }
}

/**
 * 确保用户信息就绪（有 token，有/没有手机号）
 * 统一在关键功能前调用。
 */
export async function ensureUserReady(options: EnsureOptions = {}) {
    const { needPhone = false, revalidateInterval = 5 * 60 * 1000 } = options

    // 1. 从内存 / 缓存中拿当前状态
    let { userInfo, lastUserInfoCheckTime } = getUserInfoCached()
    console.log('ensureUserReady', userInfo, lastUserInfoCheckTime)

    // 2. 动态读取 Storage 中的 token，避免模块常量造成的误判
    const token = Taro.getStorageSync('token')
    if (!token) {
        Taro.navigateTo({
            url: '/pages/login/index?redirect=' + encodeURIComponent(getCurrentPageUrl()),
        })
        return null
    }

    // 4. 做“偶尔校验一次”的策略，避免每次都请求
    const now = Date.now()
    const needRevalidate = now - lastUserInfoCheckTime > revalidateInterval

    if (!needRevalidate) {
        return userInfo
    }

    try {
        const res = await httpGet('/api/user/info')
        setUserInfo(res)
        userInfo = res

        if (res.statusCode === 401) {
            Taro.navigateTo({
                url: '/pages/login/index?redirect=' + encodeURIComponent(getCurrentPageUrl()),
            })
            return null
        }
    } catch (e) {
        console.warn('校验用户信息失败：', e)
    }

    return userInfo
}

function getCurrentPageUrl() {
    const pages = getCurrentPages()
    const current = pages[pages.length - 1]
    const route = (current as any).route
    const options = (current as any).options || {}
    const query = Object.keys(options)
        .map((key) => `${key}=${options[key]}`)
        .join('&')
    return '/' + route + (query ? '?' + query : '')
}