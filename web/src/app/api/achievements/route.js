import sql from "@/app/api/utils/sql.js";

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
  // Habit achievements
  'habit_streak_3': {
    name: 'First Steps',
    description: 'Complete habits for 3 days in a row',
    badge_icon: '🎯',
    threshold: 3,
    type: 'habit_streak'
  },
  'habit_streak_7': {
    name: 'Week Warrior',
    description: 'Complete habits for 7 days in a row',
    badge_icon: '🔥',
    threshold: 7,
    type: 'habit_streak'
  },
  'habit_streak_30': {
    name: 'Month Master',
    description: 'Complete habits for 30 days in a row',
    badge_icon: '👑',
    threshold: 30,
    type: 'habit_streak'
  },
  
  // Reflection achievements
  'reflection_count_5': {
    name: 'Mindful Moments',
    description: 'Complete 5 reflection sessions',
    badge_icon: '🧘',
    threshold: 5,
    type: 'reflection_count'
  },
  'reflection_count_25': {
    name: 'Reflection Master',
    description: 'Complete 25 reflection sessions',
    badge_icon: '💫',
    threshold: 25,
    type: 'reflection_count'
  },
  
  // Goal achievements
  'goal_created': {
    name: 'Goal Setter',
    description: 'Create your first yearly goal',
    badge_icon: '⭐',
    threshold: 1,
    type: 'goal_created'
  },
  'goal_completed': {
    name: 'Achievement Unlocked',
    description: 'Complete your first yearly goal',
    badge_icon: '🏆',
    threshold: 1,
    type: 'goal_completed'
  },
  
  // Wellness achievements
  'water_streak_7': {
    name: 'Hydration Hero',
    description: 'Log water intake for 7 days straight',
    badge_icon: '💧',
    threshold: 7,
    type: 'water_streak'
  },
  'perfect_day': {
    name: 'Perfect Day',
    description: 'Complete all habits, log mood, and reflect in one day',
    badge_icon: '🌟',
    threshold: 1,
    type: 'perfect_day'
  }
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: "userId parameter is required" 
      }), { status: 400 });
    }

    // Get user's earned achievements
    const achievements = await sql`
      SELECT * FROM user_achievements 
      WHERE user_id = ${userId}
      ORDER BY earned_date DESC
    `;

    // Get available achievements (not yet earned)
    const earnedAchievementTypes = achievements.map(a => a.achievement_type);
    const availableAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS)
      .filter(([key]) => !earnedAchievementTypes.includes(key))
      .map(([key, definition]) => ({
        id: key,
        ...definition,
        progress: 0, // This would be calculated based on user's current progress
      }));

    return new Response(JSON.stringify({ 
      earned: achievements,
      available: availableAchievements 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch achievements" 
    }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, achievementType, customData } = await request.json();

    if (!userId || !achievementType) {
      return new Response(JSON.stringify({ 
        error: "Missing userId or achievementType" 
      }), { status: 400 });
    }

    // Check if achievement already exists
    const existingAchievement = await sql`
      SELECT id FROM user_achievements 
      WHERE user_id = ${userId} AND achievement_type = ${achievementType}
    `;

    if (existingAchievement.length > 0) {
      return new Response(JSON.stringify({ 
        message: "Achievement already earned" 
      }), { status: 200 });
    }

    // Get achievement definition
    const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
    if (!definition) {
      return new Response(JSON.stringify({ 
        error: "Invalid achievement type" 
      }), { status: 400 });
    }

    // Award achievement
    const newAchievement = await sql`
      INSERT INTO user_achievements (
        user_id,
        achievement_type,
        achievement_name,
        description,
        badge_icon,
        earned_date,
        milestone_value
      ) VALUES (
        ${userId},
        ${achievementType},
        ${definition.name},
        ${definition.description},
        ${definition.badge_icon},
        CURRENT_DATE,
        ${definition.threshold}
      ) RETURNING *
    `;

    return new Response(JSON.stringify({ 
      achievement: newAchievement[0],
      message: "Achievement unlocked!" 
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error awarding achievement:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to award achievement" 
    }), { status: 500 });
  }
}

// Check and award achievements based on user activities
export async function PUT(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: "userId is required" 
      }), { status: 400 });
    }

    const newAchievements = [];

    // Check habit streak achievements
    const habitStreak = await sql`
      SELECT current_streak FROM user_streaks 
      WHERE user_id = ${userId} AND streak_type = 'habit'
    `;

    if (habitStreak.length > 0) {
      const streak = habitStreak[0].current_streak;
      
      // Check each habit streak milestone
      for (const [key, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        if (definition.type === 'habit_streak' && streak >= definition.threshold) {
          // Check if not already earned
          const existing = await sql`
            SELECT id FROM user_achievements 
            WHERE user_id = ${userId} AND achievement_type = ${key}
          `;
          
          if (existing.length === 0) {
            const achievement = await sql`
              INSERT INTO user_achievements (
                user_id, achievement_type, achievement_name, 
                description, badge_icon, earned_date, milestone_value
              ) VALUES (
                ${userId}, ${key}, ${definition.name}, 
                ${definition.description}, ${definition.badge_icon}, 
                CURRENT_DATE, ${definition.threshold}
              ) RETURNING *
            `;
            newAchievements.push(achievement[0]);
          }
        }
      }
    }

    // Check reflection count achievements
    const reflectionCount = await sql`
      SELECT COUNT(*) as count FROM journal_entries 
      WHERE user_id = ${userId}
    `;

    if (reflectionCount.length > 0) {
      const count = parseInt(reflectionCount[0].count);
      
      for (const [key, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        if (definition.type === 'reflection_count' && count >= definition.threshold) {
          const existing = await sql`
            SELECT id FROM user_achievements 
            WHERE user_id = ${userId} AND achievement_type = ${key}
          `;
          
          if (existing.length === 0) {
            const achievement = await sql`
              INSERT INTO user_achievements (
                user_id, achievement_type, achievement_name, 
                description, badge_icon, earned_date, milestone_value
              ) VALUES (
                ${userId}, ${key}, ${definition.name}, 
                ${definition.description}, ${definition.badge_icon}, 
                CURRENT_DATE, ${definition.threshold}
              ) RETURNING *
            `;
            newAchievements.push(achievement[0]);
          }
        }
      }
    }

    // Check goal achievements
    const goalCount = await sql`
      SELECT COUNT(*) as count FROM yearly_goals 
      WHERE user_id = ${userId}
    `;

    if (goalCount.length > 0 && parseInt(goalCount[0].count) > 0) {
      const existing = await sql`
        SELECT id FROM user_achievements 
        WHERE user_id = ${userId} AND achievement_type = 'goal_created'
      `;
      
      if (existing.length === 0) {
        const definition = ACHIEVEMENT_DEFINITIONS['goal_created'];
        const achievement = await sql`
          INSERT INTO user_achievements (
            user_id, achievement_type, achievement_name, 
            description, badge_icon, earned_date, milestone_value
          ) VALUES (
            ${userId}, 'goal_created', ${definition.name}, 
            ${definition.description}, ${definition.badge_icon}, 
            CURRENT_DATE, ${definition.threshold}
          ) RETURNING *
        `;
        newAchievements.push(achievement[0]);
      }
    }

    // Check perfect day achievement
    const today = new Date().toISOString().split('T')[0];
    const [habitEntries, moodEntry, journalEntry] = await sql.transaction([
      sql`
        SELECT COUNT(*) as completed FROM habit_entries he
        JOIN habits h ON he.habit_id = h.id
        WHERE he.user_id = ${userId} 
          AND he.entry_date = ${today}
          AND he.completed = true
          AND h.is_active = true
      `,
      sql`
        SELECT id FROM mood_entries 
        WHERE user_id = ${userId} AND entry_date = ${today}
      `,
      sql`
        SELECT id FROM journal_entries 
        WHERE user_id = ${userId} AND entry_date = ${today}
      `
    ]);

    const totalHabits = await sql`
      SELECT COUNT(*) as count FROM habits 
      WHERE user_id = ${userId} AND is_active = true
    `;

    const completedHabits = parseInt(habitEntries[0].completed);
    const totalHabitsCount = parseInt(totalHabits[0].count);
    const hasMoodEntry = moodEntry.length > 0;
    const hasJournalEntry = journalEntry.length > 0;

    if (completedHabits === totalHabitsCount && totalHabitsCount > 0 && hasMoodEntry && hasJournalEntry) {
      const existing = await sql`
        SELECT id FROM user_achievements 
        WHERE user_id = ${userId} AND achievement_type = 'perfect_day'
      `;
      
      if (existing.length === 0) {
        const definition = ACHIEVEMENT_DEFINITIONS['perfect_day'];
        const achievement = await sql`
          INSERT INTO user_achievements (
            user_id, achievement_type, achievement_name, 
            description, badge_icon, earned_date, milestone_value
          ) VALUES (
            ${userId}, 'perfect_day', ${definition.name}, 
            ${definition.description}, ${definition.badge_icon}, 
            CURRENT_DATE, ${definition.threshold}
          ) RETURNING *
        `;
        newAchievements.push(achievement[0]);
      }
    }

    return new Response(JSON.stringify({ 
      newAchievements,
      message: `${newAchievements.length} new achievements unlocked!` 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking achievements:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to check achievements" 
    }), { status: 500 });
  }
}