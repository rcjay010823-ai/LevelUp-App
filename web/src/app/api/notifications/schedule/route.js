import sql from "@/app/api/utils/sql.js";

export async function POST(request) {
  try {
    const { userId, type, title, body, scheduledTime, repeatPattern } = await request.json();

    // Validate input
    if (!userId || !type || !title || !scheduledTime) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: userId, type, title, scheduledTime" 
      }), { status: 400 });
    }

    // Create notification entry
    const result = await sql`
      INSERT INTO scheduled_notifications (
        user_id, 
        type, 
        title, 
        body, 
        scheduled_time, 
        repeat_pattern, 
        is_active,
        created_at
      ) VALUES (
        ${userId}, 
        ${type}, 
        ${title}, 
        ${body || ''}, 
        ${scheduledTime}, 
        ${repeatPattern || 'none'}, 
        true,
        NOW()
      ) RETURNING *
    `;

    return new Response(JSON.stringify({ 
      notification: result[0],
      message: "Notification scheduled successfully" 
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error scheduling notification:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to schedule notification" 
    }), { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: "userId parameter is required" 
      }), { status: 400 });
    }

    // Get user's scheduled notifications
    const notifications = await sql`
      SELECT * FROM scheduled_notifications 
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY scheduled_time ASC
    `;

    return new Response(JSON.stringify({ notifications }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch notifications" 
    }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { notificationId, userId } = await request.json();

    if (!notificationId || !userId) {
      return new Response(JSON.stringify({ 
        error: "Missing notificationId or userId" 
      }), { status: 400 });
    }

    // Soft delete (mark as inactive)
    const result = await sql`
      UPDATE scheduled_notifications 
      SET is_active = false 
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Notification not found" 
      }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
      message: "Notification deleted successfully" 
    }), { status: 200 });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete notification" 
    }), { status: 500 });
  }
}