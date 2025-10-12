import React from 'react'
import { cookies } from 'next/headers'
import AdminHelpClient from './AdminHelpClient'

async function getUserInfoFromCookies() {
    // Use Next.js server-side cookies API (following Next.js 15 pattern)
    const cookieStore = await cookies();
    const userEmailCookie = cookieStore.get('uinf')?.value;
    const roleCookie = cookieStore.get('role')?.value;

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
            } catch {
                // If JSON parsing fails, treat as single role value (API route format)
                userRoles = [roleCookie];
            }
        } else {
            // Default role if no role cookie found
            userRoles = ['2'];
        }
        
        const userInfo = {
            userId: 0, // Not needed for this component, setting to 0
            userRoles: userRoles
        };

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