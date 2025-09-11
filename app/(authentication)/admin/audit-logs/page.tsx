import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as jose from 'jose';
import db from '@/lib/db';
import AuditLogViewer from '../../../../components/AuditLogViewer';

async function getAuditLogs(page: number = 1, limit: number = 50, filter?: string) {
  try {
    const skip = (page - 1) * limit;
    
    let whereClause: any = {};
    if (filter) {
      whereClause = {
        OR: [
          { username: { contains: filter, mode: 'insensitive' } },
          { action: { contains: filter, mode: 'insensitive' } },
          { table_name: { contains: filter, mode: 'insensitive' } },
          { error_message: { contains: filter, mode: 'insensitive' } },
        ],
      };
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          User: {
            select: {
              id: true,
              username: true,
              firstname: true,
              lastname: true,
            },
          },
        },
      }),
      db.auditLog.count({ where: whereClause }),
    ]);

    return { logs, total };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { logs: [], total: 0 };
  }
}

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = parseInt(payload.sub || '0');

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          User_Roles: {
            include: {
              Role: true,
            },
          },
        },
      });
      return user;
    }
  } catch (error) {
    console.error('Token verification failed:', error);
  }

  return null;
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; filter?: string };
}) {
  const user = await getUserFromToken();
  
  if (!user) {
    redirect('/signin');
  }

  // Check if user has admin role
  const hasAdminRole = user.User_Roles.some(
    (userRole) => userRole.Role.role === 'admin'
  );

  if (!hasAdminRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You do not have permission to view audit logs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const page = parseInt(searchParams.page || '1');
  const filter = searchParams.filter || '';
  const { logs, total } = await getAuditLogs(page, 50, filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-gray-600">
          Track all database operations and user activities
        </p>
      </div>

      <AuditLogViewer 
        logs={logs} 
        total={total} 
        currentPage={page} 
        filter={filter} 
      />
    </div>
  );
}
