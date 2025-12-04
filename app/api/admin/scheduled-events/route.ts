import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db;

/**
 * GET - Fetch all scheduled events (pending, completed, cancelled)
 * Returns events grouped by year with detailed information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'pending'; // 'pending', 'all', 'completed', 'cancelled'

    const whereClause = statusFilter === 'all' 
      ? {} 
      : { status: statusFilter };

    const events = await prisma.scheduledEvent.findMany({
      where: whereClause,
      orderBy: [
        { scheduled_date: 'asc' },
        { event_type: 'asc' }
      ]
    });

    // Calculate days until scheduled date for pending events
    const now = new Date();
    const enhancedEvents = events.map(event => {
      const scheduledDate = new Date(event.scheduled_date);
      const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...event,
        days_until: event.status === 'pending' ? daysUntil : null,
        is_overdue: event.status === 'pending' && daysUntil < 0
      };
    });

    return NextResponse.json({
      success: true,
      events: enhancedEvents,
      total: events.length
    });

  } catch (error) {
    console.error('Failed to fetch scheduled events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled events', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );}
}

/**
 * POST - Create a new scheduled event
 * Body: { event_type, year, scheduled_date, userRoles, notes? }
 */
export async function POST(request: NextRequest) {
  try {
    const { event_type, year, scheduled_date, userRoles, notes } = await request.json();

    // Verify user is super admin
    if (!userRoles || !userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!event_type || !year || !scheduled_date) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, year, scheduled_date' },
        { status: 400 }
      );
    }

    // Validate event_type
    const validEventTypes = ['BROADCAST', 'FORM_OPENING', 'FORM_CLOSING'];
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for duplicate pending events of same type for same year
    const existingEvent = await prisma.scheduledEvent.findFirst({
      where: {
        event_type,
        year,
        status: 'pending'
      }
    });

    if (existingEvent) {
      return NextResponse.json(
        { 
          error: 'Duplicate event found',
          detail: `A pending ${event_type} event already exists for year ${year}. Please cancel the existing event first.`,
          existingEvent
        },
        { status: 409 }
      );
    }

    // Create the scheduled event
    const scheduledEvent = await prisma.scheduledEvent.create({
      data: {
        event_type,
        year,
        scheduled_date: new Date(scheduled_date),
        status: 'pending',
        notes
      }
    });

    // Log the action
    await logUserAction(
      'CREATE',
      'ScheduledEvent',
      scheduledEvent.id.toString(),
      null,
      {
        event_type,
        year,
        scheduled_date,
        notes
      },
      true,
      undefined,
      request
    );

    return NextResponse.json({
      success: true,
      event: scheduledEvent,
      message: `${event_type} scheduled successfully for year ${year}`
    });

  } catch (error) {
    console.error('Failed to create scheduled event:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled event', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );}
}

/**
 * DELETE - Cancel a scheduled event
 * Body: { eventId, userRoles }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { eventId, userRoles } = await request.json();

    // Verify user is super admin
    if (!userRoles || !userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing required field: eventId' },
        { status: 400 }
      );
    }

    // Find the event
    const event = await prisma.scheduledEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed event' },
        { status: 400 }
      );
    }

    // Update event status to cancelled
    const cancelledEvent = await prisma.scheduledEvent.update({
      where: { id: eventId },
      data: {
        status: 'cancelled',
        cancelled_at: new Date()
      }
    });

    // Log the action
    await logUserAction(
      'UPDATE',
      'ScheduledEvent',
      eventId.toString(),
      { status: event.status },
      { status: 'cancelled', cancelled_at: new Date() },
      true,
      undefined,
      request
    );

    return NextResponse.json({
      success: true,
      event: cancelledEvent,
      message: `${event.event_type} for year ${event.year} has been cancelled`
    });

  } catch (error) {
    console.error('Failed to cancel scheduled event:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled event', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );}
}
