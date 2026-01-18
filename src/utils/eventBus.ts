/**
 * 事件总线 - 用于页面间通信
 */
class EventBus {
    private events: { [key: string]: Function[] } = {}

    // 订阅事件
    on(eventName: string, callback: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        this.events[eventName].push(callback)
    }

    // 取消订阅
    off(eventName: string, callback?: Function) {
        if (!this.events[eventName]) return

        if (callback) {
            const index = this.events[eventName].indexOf(callback)
            if (index > -1) {
                this.events[eventName].splice(index, 1)
            }
        } else {
            this.events[eventName] = []
        }
    }

    // 触发事件
    emit(eventName: string, ...args: any[]) {
        if (!this.events[eventName]) return

        this.events[eventName].forEach(callback => {
            callback(...args)
        })
    }

    // 只订阅一次
    once(eventName: string, callback: Function) {
        const onceCallback = (...args: any[]) => {
            callback(...args)
            this.off(eventName, onceCallback)
        }
        this.on(eventName, onceCallback)
    }
}

// 导出单例
export const eventBus = new EventBus()

// 事件名称常量
export const EVENT_NAMES = {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS', // 登录成功
    LOGOUT: 'LOGOUT', // 退出登录
    EXPENSE_ADDED: 'EXPENSE_ADDED', // 添加支出
    EXPENSE_UPDATED: 'EXPENSE_UPDATED', // 更新支出
    EXPENSE_DELETED: 'EXPENSE_DELETED', // 删除支出
    USER_INFO_UPDATED: 'USER_INFO_UPDATED', // 用户信息更新
    TOKEN_UPDATED: 'TOKEN_UPDATED', // Token更新
}