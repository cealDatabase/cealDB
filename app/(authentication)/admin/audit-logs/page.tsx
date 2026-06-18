import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Link from 'next/link';
import AuditLogViewer from '../../../../components/AuditLogViewer';
import { Container } from '@/components/Container';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { SlashIcon } from 'lucide-react';

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

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  // Use the standard cookie-based role check (same as all other admin pages)
  const cookieStore = await cookies();
  const roleIds = cookieStore.get('role')?.value;

  let userRoleIds: string[] = [];
  try {
    userRoleIds = roleIds ? JSON.parse(roleIds) : [];
  } catch (error) {
    console.error('Failed to parse role IDs from cookie:', error);
    redirect('/admin');
  }

  // Super Admin (1) or Assistant Admin (4) can view audit logs
  const canView = userRoleIds.includes('1') || userRoleIds.includes('4');
  if (!canView) {
    redirect('/admin');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');
  const filter = resolvedParams.filter || '';
  const { logs, total } = await getAuditLogs(page, 50, filter);

  return (
    <main className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Audit Logs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all database operations and user activities
          </p>
        </div>

        <AuditLogViewer 
          logs={logs} 
          total={total} 
          currentPage={page} 
          filter={filter} 
        />
      </Container>
    </main>
  );
}
