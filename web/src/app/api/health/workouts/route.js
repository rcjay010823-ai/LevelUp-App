import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const month = searchParams.get("month"); // YYYY-MM format

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (date) {
      // Get specific date entry
      const entry = await sql`
        SELECT * FROM workout_entries 
        WHERE user_id = ${userId} AND entry_date = ${date}
      `;
      return Response.json({ entry: entry[0] || null });
    }

    if (month) {
      // Get all entries for a specific month
      console.log("Monthly workout query - month parameter:", month);
      console.log("Monthly workout query - userId:", userId);
      console.log(
        "Query will be: DATE_TRUNC('month', entry_date) =",
        month + "-01",
      );

      const entries = await sql`
        SELECT * FROM workout_entries 
        WHERE user_id = ${userId} 
        AND DATE_TRUNC('month', entry_date) = ${month + "-01"}::date
        ORDER BY entry_date DESC
      `;

      console.log("Monthly workout query result:", entries);
      console.log("Number of entries found:", entries.length);

      return Response.json({ entries });
    }

    // Get recent entries (last 30 days)
    const entries = await sql`
      SELECT * FROM workout_entries 
      WHERE user_id = ${userId} 
      AND entry_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY entry_date DESC
    `;

    return Response.json({ entries });
  } catch (error) {
    console.error("Error fetching workout entries:", error);
    return Response.json(
      { error: "Failed to fetch workout entries" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("🚀 POST /api/health/workouts - Raw body:", body);

    const { userId, date, workedOut } = body;
    console.log("🚀 POST /api/health/workouts - Parsed:", {
      userId,
      date,
      workedOut,
    });

    if (!userId || !date) {
      console.log("❌ Missing required fields:", { userId, date });
      return Response.json(
        { error: "User ID and date are required" },
        { status: 400 },
      );
    }

    console.log("💾 About to insert/update workout entry:", {
      userId,
      date,
      workedOut,
      normalizedWorkedOut: workedOut !== false,
    });

    // Insert or update workout entry
    const entry = await sql`
      INSERT INTO workout_entries (user_id, entry_date, worked_out)
      VALUES (${userId}, ${date}, ${workedOut !== false})
      ON CONFLICT (user_id, entry_date)
      DO UPDATE SET worked_out = ${workedOut !== false}
      RETURNING *
    `;

    console.log("✅ Workout entry saved:", entry[0]);

    // Check for streak milestones
    const currentStreak = await calculateWorkoutStreak(userId);
    const badges = await checkWorkoutBadges(userId, currentStreak);

    const response = {
      entry: entry[0],
      currentStreak,
      newBadges: badges,
    };

    console.log("📤 Final response:", response);
    return Response.json(response);
  } catch (error) {
    console.error("❌ Error saving workout entry:", error);
    return Response.json(
      { error: "Failed to save workout entry" },
      { status: 500 },
    );
  }
}

async function calculateWorkoutStreak(userId) {
  try {
    // Get consecutive workout days ending today
    const result = await sql`
      WITH RECURSIVE workout_streak AS (
        -- Base case: today's workout
        SELECT entry_date, worked_out, 1 as streak_length
        FROM workout_entries
        WHERE user_id = ${userId} 
        AND entry_date = CURRENT_DATE
        AND worked_out = true
        
        UNION ALL
        
        -- Recursive case: previous days
        SELECT we.entry_date, we.worked_out, ws.streak_length + 1
        FROM workout_entries we
        JOIN workout_streak ws ON we.entry_date = ws.entry_date - INTERVAL '1 day'
        WHERE we.user_id = ${userId}
        AND we.worked_out = true
      )
      SELECT COALESCE(MAX(streak_length), 0) as current_streak
      FROM workout_streak
    `;

    return result[0]?.current_streak || 0;
  } catch (error) {
    console.error("Error calculating workout streak:", error);
    return 0;
  }
}

async function checkWorkoutBadges(userId, currentStreak) {
  try {
    const newBadges = [];
    const badgeThresholds = [
      {
        days: 3,
        name: "Getting Started",
        message: "You're on your way! Three days of workouts — keep it going!",
      },
      {
        days: 7,
        name: "Consistency Queen",
        message: "One full week of workouts! Your dedication is showing.",
      },
      {
        days: 30,
        name: "LevelUP Legend",
        message: "30 days strong! You're unstoppable.",
      },
    ];

    for (const threshold of badgeThresholds) {
      if (currentStreak === threshold.days) {
        // Check if badge already earned
        const existingBadge = await sql`
          SELECT id FROM health_badges 
          WHERE user_id = ${userId} 
          AND badge_type = 'workout' 
          AND streak_days = ${threshold.days}
        `;

        if (existingBadge.length === 0) {
          // Award new badge
          await sql`
            INSERT INTO health_badges (user_id, badge_type, badge_name, streak_days, earned_date)
            VALUES (${userId}, 'workout', ${threshold.name}, ${threshold.days}, CURRENT_DATE)
          `;

          newBadges.push({
            name: threshold.name,
            message: threshold.message,
            streakDays: threshold.days,
          });
        }
      }
    }

    return newBadges;
  } catch (error) {
    console.error("Error checking workout badges:", error);
    return [];
  }
}
