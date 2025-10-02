// lib/userUtils.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all super admin users (role_id = 1)
 * Returns array of user objects with email and username
 */
export async function getSuperAdminUsers(): Promise<Array<{ id: number; username: string }>> {
  try {
    const superAdmins = await prisma.user.findMany({
      where: {
        isactive: true,
        User_Roles: {
          some: {
            role_id: 1 // Super admin role
          }
        }
      },
      select: {
        id: true,
        username: true
      }
    });

    return superAdmins;
  } catch (error) {
    console.error('Failed to fetch super admin users:', error);
    return [];
  }
}

/**
 * Get all super admin email addresses for notifications
 */
export async function getSuperAdminEmails(): Promise<string[]> {
  const superAdmins = await getSuperAdminUsers();
  return superAdmins.map(admin => admin.username).filter(email => email && email.includes('@'));
}

/**
 * Get all active user emails for broadcast notifications
 */
export async function getAllActiveUserEmails(): Promise<string[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        isactive: true
      },
      select: {
        username: true
      }
    });

    // Filter out any invalid emails
    return users
      .map(user => user.username)
      .filter(email => email && email.includes('@'));
  } catch (error) {
    console.error('Failed to fetch active user emails:', error);
    return [];
  }
}

/**
 * Get all library year records count for statistics
 */
export async function getLibraryYearCount(year: number): Promise<number> {
  try {
    const count = await prisma.library_Year.count({
      where: { year }
    });
    return count;
  } catch (error) {
    console.error('Failed to count library years:', error);
    return 0;
  }
}
