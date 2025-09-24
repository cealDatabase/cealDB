import React from 'react'
import { cookies } from 'next/headers'
import AdminHelpClient from './AdminHelpClient'

async function getUserInfoFromCookies() {
    // Use Next.js server-side cookies API (following Next.js 15 pattern)
    const cookieStore = await cookies();
    const userEmailCookie = cookieStore.get('uinf')?.value;
    const roleCookie = cookieStore.get('role')?.value;

    console.log('🍪 Server-side Debug cookies found:', {
        userEmailCookie,
        roleCookie,
        cookieNames: Array.from(cookieStore).map(([name]) => name)
    });

    if (!userEmailCookie) {
        console.log('❌ No user cookie found (uinf) - user not signed in');
        return null;
    }

    try {
        let userRoles: string[] = [];
        
        if (roleCookie) {
            // Handle both formats: JSON array (from signinAction) or single value (from API route)
            try {
                // Try parsing as JSON array first (signinAction format)
                userRoles = JSON.parse(roleCookie);
                console.log('📊 Parsed role as JSON array:', userRoles);
            } catch {
                // If JSON parsing fails, treat as single role value (API route format)
                userRoles = [roleCookie];
                console.log('📊 Parsed role as single value:', userRoles);
            }
        } else {
            // Default role if no role cookie found
            userRoles = ['2'];
        }
        
        const userInfo = {
            userId: 0, // Not needed for this component, setting to 0
            userRoles: userRoles
        };
        
        // const isSuperAdmin = userRoles.includes('1');

        return userInfo;
    } catch (error) {
        console.error('Failed to parse user info from cookies:', error);
        return null;
    }
}

export default async function AdminHelpPage() {
    // Get user info from server-side cookies
    const userInfo = await getUserInfoFromCookies();
    
    // Pass to client component
    return <AdminHelpClient userInfo={userInfo} />;
}