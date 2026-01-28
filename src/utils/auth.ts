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
const TOKEN = Taro.getStorageSync('token')
export function setUserInfo(userInfo: any) {
    const app = Taro.getApp<IAppOption>()
    console.log('setUserInfo', app)
    const now = Date.now()

    // 安全检查：确保 app 和 globalData 存在
    if (app) {
        if (!app.globalData) {
            app.globalData = {}
        }
        app.globalData.userInfo = userInfo
        app.globalData.lastUserInfoCheckTime = now
    }

    // 无论如何都更新本地存储
    Taro.setStorageSync(USER_INFO_KEY, {
        userInfo,
        lastUserInfoCheckTime: now,
    })
}
// 从内存 / 缓存中拿当前状态
export function getUserInfoCached() {
    const app = Taro.getApp<IAppOption>()
    
    // 安全检查：确保 app 存在
    if (!app) {
        // 内存没有就从 storage 读一次
        const cache = Taro.getStorageSync(USER_INFO_KEY)
        if (cache) {
            return cache
        }
        return { userInfo: null, lastUserInfoCheckTime: 0 }
    }
    
    // 安全检查：确保 app.globalData 存在
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

    // 内存没有就从 storage 读一次
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


/**
 * 确保用户信息就绪（有 token，有/没有手机号）
 * 统一在关键功能前调用。
 */
export async function ensureUserReady(options: EnsureOptions = {}) {
    const { needPhone = false, revalidateInterval = 5 * 60 * 1000 } = options

    // 1. 从内存 / 缓存中拿当前状态
    let { userInfo, lastUserInfoCheckTime } = getUserInfoCached()
    console.log('ensureUserReady', userInfo, lastUserInfoCheckTime)
    // 2. 没有 token -> 去登录
    if (!TOKEN) {
        // 这里可以根据需求，跳登录页或弹窗提示
        Taro.navigateTo({
            url: '/pages/login/index?redirect=' + encodeURIComponent(getCurrentPageUrl()),
        })
        return null
    }

    // 3. 如果业务要求一定要有手机号
    // if (needPhone && !userInfo.mobile) {
    //     Taro.navigateTo({
    //         url: '/pages/bind-phone/index?redirect=' + encodeURIComponent(getCurrentPageUrl()),
    //     })
    //     return null
    // }

    // 4. 做“偶尔校验一次”的策略，避免每次都请求
    const now = Date.now()
    const needRevalidate = now - lastUserInfoCheckTime > revalidateInterval

    if (!needRevalidate) {
        // 间隔内直接用缓存
        return userInfo
    }

    // 5. 超出间隔了，才请求一次服务端，更新用户信息
    try {
        // 从接口获取用户信息
        const res = await httpGet('api/user/info')
        setUserInfo(res)
        
        // 更新userInfo为最新的信息
        userInfo = res

        // 如果需要手机号但接口仍然没有，就再提示一次
        // if (needPhone && !res.mobile) {
        //     Taro.navigateTo({
        //         url: '/pages/bind-phone/index?redirect=' + encodeURIComponent(getCurrentPageUrl()),
        //     })
        //     return null
        // }

        // token 过期等情况 -> 去登录
        if (res.statusCode === 401) {
            Taro.navigateTo({
                url: '/pages/login/index?redirect=' + encodeURIComponent(getCurrentPageUrl()),
            })
            return null
        }
    } catch (e) {
        console.warn('校验用户信息失败：', e)
        // 这里看你要不要强制登录/弹提示
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