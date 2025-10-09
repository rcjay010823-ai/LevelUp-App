import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // 'wellness', 'mood', 'habits', 'goals', 'overview'
    const range = searchParams.get("range") || "week"; // 'week', 'month', 'year'

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const today = new Date();
    let startDate;

    // Calculate date range based on period
    switch (range) {
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
    }

    // If no type specified or type is 'overview', return comprehensive analytics
    if (!type || type === "overview") {
      const [
        habitStats,
        moodStats,
        goalProgress,
        streakData,
        achievements,
        weeklyTrends,
        taskCompletion,
        wellnessMetrics,
      ] = await sql.transaction([
        // Habit completion stats
        sql`
          SELECT 
            COUNT(CASE WHEN completed = true THEN 1 END) as completed_habits,
            COUNT(*) as total_habit_entries,
            ROUND(
              (COUNT(CASE WHEN completed = true THEN 1 END)::float / 
               NULLIF(COUNT(*), 0)) * 100, 1
            ) as completion_rate
          FROM habit_entries he
          JOIN habits h ON he.habit_id = h.id
          WHERE he.user_id = ${userId} 
            AND he.entry_date >= ${startDate.toISOString().split("T")[0]}
            AND h.is_active = true
        `,

        // Mood analytics
        sql`
          SELECT 
            AVG(mood_value) as average_mood,
            COUNT(*) as mood_entries,
            mode() WITHIN GROUP (ORDER BY mood_emoji) as most_common_mood
          FROM mood_entries 
          WHERE user_id = ${userId} 
            AND entry_date >= ${startDate.toISOString().split("T")[0]}
        `,

        // Goal progress
        sql`
          SELECT 
            COUNT(*) as total_goals,
            COUNT(CASE WHEN is_done = true THEN 1 END) as completed_goals,
            ROUND(
              (COUNT(CASE WHEN is_done = true THEN 1 END)::float / 
               NULLIF(COUNT(*), 0)) * 100, 1
            ) as goal_completion_rate
          FROM yearly_goals 
          WHERE user_id = ${userId}
            AND year = EXTRACT(YEAR FROM CURRENT_DATE)
        `,

        // Current streaks
        sql`
          SELECT 
            streak_type,
            current_streak,
            longest_streak,
            last_activity_date
          FROM user_streaks 
          WHERE user_id = ${userId}
        `,

        // Recent achievements
        sql`
          SELECT 
            achievement_name,
            description,
            badge_icon,
            earned_date,
            milestone_value
          FROM user_achievements 
          WHERE user_id = ${userId}
          ORDER BY earned_date DESC
          LIMIT 5
        `,

        // Weekly trend data for charts
        sql`
          SELECT 
            DATE_TRUNC('week', he.entry_date) as week_start,
            COUNT(CASE WHEN he.completed = true THEN 1 END) as completed_count,
            COUNT(*) as total_count
          FROM habit_entries he
          JOIN habits h ON he.habit_id = h.id
          WHERE he.user_id = ${userId} 
            AND he.entry_date >= ${startDate.toISOString().split("T")[0]}
            AND h.is_active = true
          GROUP BY DATE_TRUNC('week', he.entry_date)
          ORDER BY week_start
        `,

        // Task completion this period
        sql`
          SELECT 
            COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
            COUNT(*) as total_tasks
          FROM todos 
          WHERE todo_date >= ${startDate.toISOString().split("T")[0]}
        `,

        // Wellness metrics
        sql`
          SELECT 
            AVG(water_ml) as avg_water,
            AVG(steps) as avg_steps,
            AVG(sleep_hours) as avg_sleep,
            COUNT(*) as wellness_entries
          FROM wellness 
          WHERE wellness_date >= ${startDate.toISOString().split("T")[0]}
        `,
      ]);

      // Calculate productivity score
      const habitCompletionRate = habitStats[0]?.completion_rate || 0;
      const goalCompletionRate = goalProgress[0]?.goal_completion_rate || 0;
      const taskCompletionRate =
        taskCompletion[0]?.total_tasks > 0
          ? (taskCompletion[0]?.completed_tasks /
              taskCompletion[0]?.total_tasks) *
            100
          : 0;

      const productivityScore = Math.round(
        habitCompletionRate * 0.4 +
          goalCompletionRate * 0.3 +
          taskCompletionRate * 0.3,
      );

      // Build comprehensive response
      const analytics = {
        period: range,
        productivityScore,

        // Core metrics
        habits: {
          completionRate: habitStats[0]?.completion_rate || 0,
          completedHabits: habitStats[0]?.completed_habits || 0,
          totalEntries: habitStats[0]?.total_habit_entries || 0,
        },

        mood: {
          averageMood: parseFloat(moodStats[0]?.average_mood || 0).toFixed(1),
          moodEntries: moodStats[0]?.mood_entries || 0,
          mostCommonMood: moodStats[0]?.most_common_mood || "😊",
        },

        goals: {
          completionRate: goalProgress[0]?.goal_completion_rate || 0,
          completedGoals: goalProgress[0]?.completed_goals || 0,
          totalGoals: goalProgress[0]?.total_goals || 0,
        },

        tasks: {
          completedTasks: taskCompletion[0]?.completed_tasks || 0,
          totalTasks: taskCompletion[0]?.total_tasks || 0,
          completionRate: taskCompletionRate,
        },

        wellness: {
          avgWater: Math.round(wellnessMetrics[0]?.avg_water || 0),
          avgSteps: Math.round(wellnessMetrics[0]?.avg_steps || 0),
          avgSleep: parseFloat(wellnessMetrics[0]?.avg_sleep || 0).toFixed(1),
          entriesCount: wellnessMetrics[0]?.wellness_entries || 0,
        },

        // Gamification data
        streaks: streakData.reduce((acc, streak) => {
          acc[streak.streak_type] = {
            current: streak.current_streak,
            longest: streak.longest_streak,
            lastActivity: streak.last_activity_date,
          };
          return acc;
        }, {}),

        achievements: achievements,

        // Chart data
        weeklyTrends: weeklyTrends.map((trend) => ({
          week: trend.week_start,
          completionRate:
            trend.total_count > 0
              ? Math.round((trend.completed_count / trend.total_count) * 100)
              : 0,
          completed: trend.completed_count,
          total: trend.total_count,
        })),

        // Quick stats for home screen
        weeklyHabitStreak:
          streakData.find((s) => s.streak_type === "habit")?.current_streak ||
          0,
        completedTasksThisWeek: taskCompletion[0]?.completed_tasks || 0,
        averageMood: parseFloat(moodStats[0]?.average_mood || 0),
      };

      return Response.json(analytics);
    }

    let dateCondition = "";
    if (range === "week") {
      dateCondition = "AND DATE >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (range === "month") {
      dateCondition = "AND DATE >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (range === "year") {
      dateCondition = "AND DATE >= CURRENT_DATE - INTERVAL '365 days'";
    }

    if (type === "wellness") {
      const data = await sql(`
        SELECT 
          wellness_date as date,
          water_ml,
          steps,
          sleep_hours
        FROM wellness 
        WHERE 1=1 ${dateCondition.replace("DATE", "wellness_date")}
        ORDER BY wellness_date ASC
      `);

      return Response.json({ data });
    } else if (type === "mood") {
      const data = await sql(
        `
        SELECT 
          entry_date as date,
          mood_value,
          mood_emoji
        FROM mood_entries 
        WHERE user_id = $1 ${dateCondition.replace("DATE", "entry_date")}
        ORDER BY entry_date ASC
      `,
        [userId],
      );

      return Response.json({ data });
    } else if (type === "habits") {
      // Get habit completion rates
      const data = await sql(
        `
        SELECT 
          h.title,
          h.color,
          COUNT(he.id) as total_days,
          COUNT(CASE WHEN he.completed = true THEN 1 END) as completed_days,
          ROUND(
            (COUNT(CASE WHEN he.completed = true THEN 1 END)::float / 
             NULLIF(COUNT(he.id), 0)) * 100, 
            1
          ) as completion_rate
        FROM habits h
        LEFT JOIN habit_entries he ON h.id = he.habit_id ${dateCondition.replace("DATE", "he.entry_date")}
        WHERE h.user_id = $1 AND h.is_active = true
        GROUP BY h.id, h.title, h.color
        ORDER BY completion_rate DESC
      `,
        [userId],
      );

      return Response.json({ data });
    } else if (type === "goals") {
      // Get goals completion stats
      const yearlyGoals = await sql`
        SELECT 
          COUNT(*) as total_goals,
          COUNT(CASE WHEN is_done = true THEN 1 END) as completed_goals,
          ROUND(
            (COUNT(CASE WHEN is_done = true THEN 1 END)::float / 
             NULLIF(COUNT(*), 0)) * 100, 
            1
          ) as completion_rate
        FROM yearly_goals 
        WHERE user_id = ${userId}
      `;

      const subGoals = await sql`
        SELECT 
          COUNT(*) as total_sub_goals,
          COUNT(CASE WHEN is_done = true THEN 1 END) as completed_sub_goals,
          ROUND(
            (COUNT(CASE WHEN is_done = true THEN 1 END)::float / 
             NULLIF(COUNT(*), 0)) * 100, 
            1
          ) as completion_rate
        FROM sub_goals 
        WHERE user_id = ${userId}
      `;

      return Response.json({
        data: {
          yearly_goals: yearlyGoals[0],
          sub_goals: subGoals[0],
        },
      });
    }

    return Response.json({ error: "Invalid analytics type" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
