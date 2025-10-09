import sql from "../utils/sql";

// Get countdown events for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const countdownEvents = await sql`
      SELECT * FROM countdown_events 
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY target_date ASC
    `;

    return Response.json({ countdownEvents });
  } catch (error) {
    console.error("Error fetching countdown events:", error);
    return Response.json({ error: "Failed to fetch countdown events" }, { status: 500 });
  }
}

// Create a new countdown event
export async function POST(request) {
  try {
    const { userId, title, target_date, description, emoji, color } = await request.json();

    if (!userId || !title || !target_date) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newEvent] = await sql`
      INSERT INTO countdown_events (user_id, title, target_date, description, emoji, color)
      VALUES (${userId}, ${title}, ${target_date}, ${description || ''}, ${emoji || '🎉'}, ${color || '#FF6B9D'})
      RETURNING *
    `;

    return Response.json({ countdownEvent: newEvent });
  } catch (error) {
    console.error("Error creating countdown event:", error);
    return Response.json({ error: "Failed to create countdown event" }, { status: 500 });
  }
}

// Update a countdown event
export async function PUT(request) {
  try {
    const { id, userId, title, target_date, description, emoji, color } = await request.json();

    if (!id || !userId) {
      return Response.json({ error: "ID and User ID are required" }, { status: 400 });
    }

    const [updatedEvent] = await sql`
      UPDATE countdown_events 
      SET title = ${title}, target_date = ${target_date}, description = ${description}, emoji = ${emoji}, color = ${color}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (!updatedEvent) {
      return Response.json({ error: "Countdown event not found" }, { status: 404 });
    }

    return Response.json({ countdownEvent: updatedEvent });
  } catch (error) {
    console.error("Error updating countdown event:", error);
    return Response.json({ error: "Failed to update countdown event" }, { status: 500 });
  }
}

// Delete a countdown event
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return Response.json({ error: "ID and User ID are required" }, { status: 400 });
    }

    await sql`
      UPDATE countdown_events 
      SET is_active = false
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return Response.json({ message: "Countdown event deleted" });
  } catch (error) {
    console.error("Error deleting countdown event:", error);
    return Response.json({ error: "Failed to delete countdown event" }, { status: 500 });
  }
}