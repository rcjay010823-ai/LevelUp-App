import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    // Ensure user can only access their own habits
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (date) {
      // Get habits with completion status for specific date
      const habits = await sql`
        SELECT h.*, 
               COALESCE(he.completed, false) as completed,
               he.id as entry_id
        FROM habits h
        LEFT JOIN habit_entries he ON h.id = he.habit_id AND he.entry_date = ${date}
        WHERE h.user_id = ${userId} AND h.is_active = true
        ORDER BY h.order_index ASC
      `;
      return Response.json({ habits });
    } else {
      // Get all active habits
      const habits = await sql`
        SELECT * FROM habits 
        WHERE user_id = ${userId} AND is_active = true
        ORDER BY order_index ASC
      `;
      return Response.json({ habits });
    }
  } catch (error) {
    console.error("Error fetching habits:", error);
    return Response.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, title, color } = await request.json();

    // Ensure user can only create habits for themselves
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    // Get max order index
    const [maxOrder] = await sql`
      SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
      FROM habits WHERE user_id = ${userId}
    `;

    const [habit] = await sql`
      INSERT INTO habits (user_id, title, color, order_index)
      VALUES (${userId}, ${title.trim()}, ${color || "#3B82F6"}, ${maxOrder.next_order})
      RETURNING *
    `;

    return Response.json({ habit });
  } catch (error) {
    console.error("Error creating habit:", error);
    return Response.json({ error: "Failed to create habit" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, userId, title, color, orderIndex, isActive } =
      await request.json();

    // Ensure user can only update their own habits
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!id) {
      return Response.json({ error: "Habit ID is required" }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let paramCount = 0;

    if (title !== undefined) {
      updates.push(`title = $${++paramCount}`);
      values.push(title.trim());
    }
    if (color !== undefined) {
      updates.push(`color = $${++paramCount}`);
      values.push(color);
    }
    if (orderIndex !== undefined) {
      updates.push(`order_index = $${++paramCount}`);
      values.push(orderIndex);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${++paramCount}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id, userId);
    const [habit] = await sql(
      `
      UPDATE habits 
      SET ${updates.join(", ")}
      WHERE id = $${++paramCount} AND user_id = $${++paramCount}
      RETURNING *
    `,
      values,
    );

    if (!habit) {
      return Response.json(
        { error: "Habit not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json({ habit });
  } catch (error) {
    console.error("Error updating habit:", error);
    return Response.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    // Ensure user can only delete their own habits
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!id) {
      return Response.json({ error: "Habit ID is required" }, { status: 400 });
    }

    const [deletedHabit] = await sql`
      DELETE FROM habits 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (!deletedHabit) {
      return Response.json(
        { error: "Habit not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return Response.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
