import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { habit_id, user_id, entry_date, completed } = await request.json();

    if (!habit_id || !user_id || !entry_date || completed === undefined) {
      return Response.json(
        { error: "Habit ID, User ID, date, and completed status are required" },
        { status: 400 },
      );
    }

    const [entry] = await sql`
      INSERT INTO habit_entries (habit_id, user_id, entry_date, completed)
      VALUES (${habit_id}, ${user_id}, ${entry_date}, ${completed})
      ON CONFLICT (habit_id, entry_date) 
      DO UPDATE SET completed = ${completed}
      RETURNING *
    `;

    return Response.json({ entry });
  } catch (error) {
    console.error("Error saving habit entry:", error);
    return Response.json(
      { error: "Failed to save habit entry" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const habitId = searchParams.get("habitId");
    const range = searchParams.get("range"); // 'week', 'month', 'year'

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    let dateCondition = "";
    if (range === "week") {
      dateCondition = "AND entry_date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (range === "month") {
      dateCondition = "AND entry_date >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (range === "year") {
      dateCondition = "AND entry_date >= CURRENT_DATE - INTERVAL '365 days'";
    }

    if (habitId) {
      // Get entries for specific habit
      const entries = await sql(
        `
        SELECT he.*, h.title, h.color
        FROM habit_entries he
        JOIN habits h ON he.habit_id = h.id
        WHERE he.user_id = $1 AND he.habit_id = $2 ${dateCondition}
        ORDER BY he.entry_date DESC
      `,
        [userId, habitId],
      );

      return Response.json({ entries });
    } else {
      // Get all habit entries for analytics
      const entries = await sql(
        `
        SELECT he.*, h.title, h.color
        FROM habit_entries he
        JOIN habits h ON he.habit_id = h.id
        WHERE he.user_id = $1 ${dateCondition}
        ORDER BY he.entry_date DESC
      `,
        [userId],
      );

      return Response.json({ entries });
    }
  } catch (error) {
    console.error("Error fetching habit entries:", error);
    return Response.json(
      { error: "Failed to fetch habit entries" },
      { status: 500 },
    );
  }
}
