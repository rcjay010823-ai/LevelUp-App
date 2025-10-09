import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let events;

    if (startDate && endDate) {
      // Query for date range (monthly view)
      events = await sql`
        SELECT id, title, event_date, event_time, location, type, end_time, notes, priority, color
        FROM events 
        WHERE event_date >= ${startDate} 
        AND event_date <= ${endDate}
        ORDER BY event_date ASC, event_time ASC
      `;
    } else if (date) {
      // Query for specific date (daily view)
      events = await sql`
        SELECT id, title, event_date, event_time, location, type, end_time, notes, priority, color
        FROM events 
        WHERE event_date = ${date}
        ORDER BY event_time ASC
      `;
    } else {
      return Response.json(
        { error: "Date parameter or date range is required" },
        { status: 400 },
      );
    }

    return Response.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      title,
      event_date,
      event_time,
      location,
      type,
      endAt,
      startAt,
      userId,
      notes,
      priority,
      color,
    } = await request.json();

    if (!title || (!event_date && !startAt)) {
      return Response.json(
        { error: "Title and date are required" },
        { status: 400 },
      );
    }

    // Handle different date formats
    const finalEventDate = event_date || startAt?.split("T")[0];
    const finalEventTime = event_time || startAt?.split("T")[1]?.slice(0, 5);
    const finalEndTime = endAt?.split("T")[1]?.slice(0, 5);

    const [event] = await sql`
      INSERT INTO events (title, event_date, event_time, location, type, end_time, notes, priority, color)
      VALUES (${title}, ${finalEventDate}, ${finalEventTime}, ${location || ""}, ${type || "general"}, ${finalEndTime || finalEventTime}, ${notes || ""}, ${priority || ""}, ${color || "#3B82F6"})
      RETURNING id, title, event_date, event_time, location, type, end_time, notes, priority, color
    `;

    return Response.json({ event });
  } catch (error) {
    console.error("Error creating event:", error);
    return Response.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const {
      id,
      title,
      event_date,
      event_time,
      location,
      type,
      endAt,
      startAt,
      userId,
      notes,
      priority,
      color,
    } = await request.json();

    if (!id || !title) {
      return Response.json(
        { error: "ID and title are required" },
        { status: 400 },
      );
    }

    // Handle different date formats
    const finalEventDate = event_date || startAt?.split("T")[0];
    const finalEventTime = event_time || startAt?.split("T")[1]?.slice(0, 5);
    const finalEndTime = endAt?.split("T")[1]?.slice(0, 5);

    const [event] = await sql`
      UPDATE events 
      SET title = ${title}, 
          event_date = ${finalEventDate}, 
          event_time = ${finalEventTime},
          location = ${location || ""},
          type = ${type || "general"},
          end_time = ${finalEndTime || finalEventTime},
          notes = ${notes || ""},
          priority = ${priority || ""},
          color = ${color || "#3B82F6"}
      WHERE id = ${id}
      RETURNING id, title, event_date, event_time, location, type, end_time, notes, priority, color
    `;

    return Response.json({ event });
  } catch (error) {
    console.error("Error updating event:", error);
    return Response.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM events WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
