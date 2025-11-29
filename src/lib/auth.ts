'use client';

import { 
    LoginCredentials, 
    AuthResponse, 
    ErrorResponse, 
    UserClaims, 
    ApiResponse 
} from '@/types/auth'; 

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bis.runasp.net/api';

function decodeJwt(token: string): UserClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
        console.error('Invalid JWT format.');
        return null;
    }
    
    const payload = parts[1];
    
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const claims = JSON.parse(jsonPayload);
    
    return {
      name: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role: claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    } as UserClaims;

  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}


export async function login(credentials: LoginCredentials): Promise<UserClaims> {
  try {
    const response = await fetch(`${API_URL}/auth/login-with-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const apiResponse: ApiResponse = await response.json(); 

    if (!response.ok) {
        const errorData = apiResponse as ErrorResponse; 
        throw new Error(errorData.message || 'فشل تسجيل الدخول بسبب خطأ في السيرفر.');
    }

    const successData = apiResponse as AuthResponse;
    
    const token = successData.token; 

    if (!token || typeof token !== 'string') {
        throw new Error('تم تسجيل الدخول بنجاح، ولكن رمز المصادقة (Token) مفقود من استجابة السيرفر.');
    }

    const userClaims = decodeJwt(token);

    if (!userClaims) {
        throw new Error('فشل استخراج بيانات المستخدم من التوكن، يرجى مراجعة فريق Backend.');
    }

    localStorage.setItem('authToken', token);
    
    return userClaims; 

  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}