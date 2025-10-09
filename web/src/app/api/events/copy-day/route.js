import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, sourceDate, targetDate } = await request.json();

    if (!userId || !sourceDate || !targetDate) {
      return Response.json(
        { error: "userId, sourceDate, and targetDate are required" },
        { status: 400 }
      );
    }

    if (sourceDate === targetDate) {
      return Response.json(
        { error: "Source and target dates cannot be the same" },
        { status: 400 }
      );
    }

    // Fetch all events from source date
    const sourceEvents = await sql`
      SELECT title, event_time, location, type, end_time, notes, priority, color
      FROM events 
      WHERE event_date = ${sourceDate}
      ORDER BY event_time ASC
    `;

    if (sourceEvents.length === 0) {
      return Response.json(
        { error: "No events found on the source date" },
        { status: 404 }
      );
    }

    // Create new events for target date
    const createdEvents = [];
    
    for (const event of sourceEvents) {
      const [newEvent] = await sql`
        INSERT INTO events (title, event_date, event_time, location, type, end_time, notes, priority, color)
        VALUES (${event.title}, ${targetDate}, ${event.event_time}, ${event.location}, ${event.type}, ${event.end_time}, ${event.notes}, ${event.priority}, ${event.color})
        RETURNING id, title, event_date, event_time, location, type, end_time, notes, priority, color
      `;
      createdEvents.push(newEvent);
    }

    return Response.json({ 
      success: true, 
      events: createdEvents,
      count: createdEvents.length 
    });
  } catch (error) {
    console.error("Error copying day events:", error);
    return Response.json({ error: "Failed to copy day events" }, { status: 500 });
  }
}