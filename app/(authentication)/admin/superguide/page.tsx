import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SuperGuideClient from './SuperGuideClient'

async function getUserInfoFromCookies() {
    const cookieStore = await cookies();
    const userEmailCookie = cookieStore.get('uinf')?.value;
    const roleCookie = cookieStore.get('role')?.value;

    if (!userEmailCookie) {
        return null;
    }

    try {
        let userRoles: string[] = [];
        if (roleCookie) {
            try {
                userRoles = JSON.parse(roleCookie);
            } catch {
                userRoles = [roleCookie];
            }
        }
        return { userId: 0, userRoles };
    } catch (error) {
        console.error('Failed to parse user info from cookies:', error);
        return null;
    }
}

export default async function SuperGuidePage() {
    const userInfo = await getUserInfoFromCookies();

    // Restrict access to Super Admin (role 1) and Assistant Admin (role 4)
    if (!userInfo) {
        redirect('/signin');
    }
    const isAllowed = userInfo.userRoles.includes('1') || userInfo.userRoles.includes('4');
    if (!isAllowed) {
        redirect('/unauthorized');
    }

    return <SuperGuideClient userInfo={userInfo} />;
}