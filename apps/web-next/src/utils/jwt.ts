import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { ResponseCode, ResponseMessage, ResponseUtil, createJsonResponse } from '../lib/response';

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

export interface AuthOptions {
    allowGuest?: boolean;
    tokenSources?: Array<'header' | 'cookie' | 'query'>;
}

// jwt 中间件
export async function withAuth(
    handler: (request: AuthenticatedRequest) => Promise<Response>,
    options: AuthOptions = { allowGuest: false, tokenSources: ['header', 'cookie'] }
) {
    return async (request: NextRequest) => {
        if (request.method === 'OPTIONS') {
            return createJsonResponse(ResponseUtil.success(null), { status: 204 })
        }

        const { user, error } = verifyToken(request, options.tokenSources)

        if (!user) {
            const isExpired = error === 'TOKEN_EXPIRED'
            const code = isExpired ? ResponseCode.TOKEN_EXPIRED : ResponseCode.UNAUTHORIZED
            const message = isExpired ? ResponseMessage.TOKEN_EXPIRED : ResponseMessage.UNAUTHORIZED

            if (options.allowGuest) {
                const authenticatedRequest = request as AuthenticatedRequest
                authenticatedRequest.user = undefined
                return await handler(authenticatedRequest)
            }

            return createJsonResponse(ResponseUtil.error(message, code), { status: 401 })
        }

        const authenticatedRequest = request as AuthenticatedRequest
        authenticatedRequest.user = user
        return await handler(authenticatedRequest)
    }
}

function extractToken(req: NextRequest, sources: Array<'header' | 'cookie' | 'query'> = ['header', 'cookie']) {
    for (const src of sources) {
        if (src === 'header') {
            const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
            if (authHeader && authHeader.startsWith('Bearer ')) {
                return authHeader.substring(7)
            }
        }
        if (src === 'cookie') {
            const cookieToken = req.cookies.get('token')?.value
            if (cookieToken) return cookieToken
        }
        if (src === 'query') {
            const urlToken = req.nextUrl.searchParams.get('token')
            if (urlToken) return urlToken
        }
    }
    return null
}

function verifyToken(req: NextRequest, sources: Array<'header' | 'cookie' | 'query'> = ['header', 'cookie']) {
    const token = extractToken(req, sources)
    if (!token) {
        return { user: undefined, error: 'MISSING_AUTH' as const }
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
        return { user: undefined, error: 'NO_SECRET' as const }
    }

    try {
        const decoded = jwt.verify(token, secret) as JWTPayload
        return { user: decoded, error: undefined }
    } catch (err: any) {
        if (err?.name === 'TokenExpiredError') {
            return { user: undefined, error: 'TOKEN_EXPIRED' as const }
        }
        return { user: undefined, error: 'INVALID_TOKEN' as const }
    }
}
