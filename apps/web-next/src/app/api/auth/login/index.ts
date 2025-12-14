import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma'
import { createJsonResponse, ResponseUtil } from "@/lib/response";

// 小程序相关配置
const WECHAT_CONFIG = {
    appid: process.env.WECHAT_APPID,
    appSecret: process.env.WECHAT_APPSECRET,
    grantType: 'authorization_code',
}

const JWT_SECRET = process.env.JWT_SECRET || '';
interface WechatLoginResponse {
    openid: string
    session_key: string
    unionid?: string
    errcode?: number
    errmsg?: string
}

interface LoginRequest {
    code: string
    nickName?: string
    avatarUrl?: string
}

export async function POST(request: NextRequest) {
    try {
        // 尝试从请求体获取数据，但如果请求体为空或不是JSON格式，则捕获错误
        let body: LoginRequest = { code: '' };
        let code: string | null = null;
        // let nickName: string | undefined;
        // let avatarUrl: string | undefined;

        try {
            body = await request.json();
            code = body.code;
            // nickName = body.nickName;
            // avatarUrl = body.avatarUrl;
        } catch (error) {
            // json 解析失败，尝试从查询参数中找code
            code = request.nextUrl.searchParams.get('code')
        }
        if (!code) {
            return createJsonResponse(ResponseUtil.error('code不能为空'), { status: 400 })
        }
        // 第一步：使用code向微信服务器获取openid和session_key
        const wechatUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&js_code=${code}&grant_type=${WECHAT_CONFIG.grantType}`
        const wxResponse = await fetch(wechatUrl);
        const wxData: WechatLoginResponse = await wxResponse.json();
        // 检察API是否调用成功
        if (wxData.errcode) {
            return createJsonResponse(
                ResponseUtil.error(`微信登录失败: ${wxData.errmsg}`),
                { status: 400 }
            )
        }
        const { openid, session_key } = wxData;

        // 根据opened查用户是否存在
        let user = await prisma.user.findUnique({
            where: {
                openId: openid,
            }
        })
        if (!user) {
            // 不存在则创建用户
            user = await prisma.user.create({
                data: {
                    openId: openid,
                }
            })
        } else {
            // 存在则更新最后登录时间
            user = await prisma.user.update({
                where: { openId: openid },
                data: {
                    lastLoginAt: new Date()
                }
            })
        }
        // 生成JWT token
        const tokenPayload = {
            userId: user.id,
            openId: user.openId,
            nickname: user.nickName,
            iat: Math.floor(Date.now() / 1000),
            exp: process.env.JWT_EXPIRES_IN,

        }
        const token = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        })
        const responseData = {
            token,
            userId: user.id,
            userInfo: {
                id: user.id,
                nickName: user.nickName,
                avatarUrl: user.avatarUrl,
            }
        }
        return createJsonResponse(
            ResponseUtil.success(responseData, '登录成功')
        )
    } catch (error) {
        return createJsonResponse(
            ResponseUtil.error('服务器内部错误'),
            { status: 500 }
        )
    }
}