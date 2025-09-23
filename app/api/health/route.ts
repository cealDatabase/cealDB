import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Health Check API Route
 * 
 * This endpoint provides system health status including:
 * - Database connectivity
 * - API responsiveness 
 * - Basic system information
 * 
 * Used by GitHub Actions and monitoring systems to verify deployment health.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test database connectivity with a simple query
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    const dbConnected = Array.isArray(dbTest) && dbTest.length > 0;
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        responseTime: `${responseTime}ms`
      },
      api: {
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB"
      }
    };

    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error("Health check failed:", error);
    
    const errorStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        type: "database_connection_failed"
      },
      database: {
        connected: false,
        error: true
      },
      api: {
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
      }
    };

    return NextResponse.json(errorStatus, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * HEAD method for lightweight health checks
 * Returns only headers without body for monitoring systems
 */
export async function HEAD(request: NextRequest) {
  try {
    // Quick database test
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'healthy'
      }
    });
  } catch (error) {
    await prisma.$disconnect();
    
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy'
      }
    });
  }
}
