import jwt from 'jsonwebtoken';
import { NextRequest, NestResponse, NextResponse } from 'next/server';
import { ResponseCode, ResponseMessage } from './response';
export interface JWTPayload {
    userId: string
    openId: string
    nickName: string
    iat: number
    exp: number
}
export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload
}

// jwt 中间件
export async function withAuth(handler: (request: AuthenticatedRequest) => Promise<Response>) {
    return async (request: NextRequest) => {
        const user = await verifyToken(request)

        if (!user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: ResponseMessage.UNAUTHORIZED,
                    code: ResponseCode.UNAUTHORIZED
                }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        }

        // 将用户信息附加到请求对象
        const authenticatedRequest = request as AuthenticatedRequest
        authenticatedRequest.user = user

        return await handler(authenticatedRequest)
    }
}

function verifyToken(req: AuthenticatedRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No authorization header')
    } else {
        const token = authHeader.substring(7)
        // 验证code
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return decoded as JWTPayload
    }
}
