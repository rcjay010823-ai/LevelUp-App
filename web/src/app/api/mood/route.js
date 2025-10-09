import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const range = searchParams.get('range'); // 'week', 'month', 'year'
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (date) {
      // Get mood for specific date
      const [mood] = await sql`
        SELECT * FROM mood_entries 
        WHERE user_id = ${userId} AND entry_date = ${date}
      `;
      return Response.json({ mood });
    } else if (range) {
      // Get mood analytics for range
      let dateCondition = '';
      if (range === 'week') {
        dateCondition = "AND entry_date >= CURRENT_DATE - INTERVAL '7 days'";
      } else if (range === 'month') {
        dateCondition = "AND entry_date >= CURRENT_DATE - INTERVAL '30 days'";
      } else if (range === 'year') {
        dateCondition = "AND entry_date >= CURRENT_DATE - INTERVAL '365 days'";
      }
      
      const moods = await sql(`
        SELECT entry_date, mood_value, mood_emoji, notes 
        FROM mood_entries 
        WHERE user_id = $1 ${dateCondition}
        ORDER BY entry_date DESC
      `, [userId]);
      
      return Response.json({ moods });
    } else {
      // Get recent moods
      const moods = await sql`
        SELECT * FROM mood_entries 
        WHERE user_id = ${userId}
        ORDER BY entry_date DESC
        LIMIT 30
      `;
      return Response.json({ moods });
    }
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return Response.json({ error: 'Failed to fetch mood entries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, date, moodValue, moodEmoji, notes } = await request.json();
    
    if (!userId || !date || !moodValue || !moodEmoji) {
      return Response.json({ error: 'User ID, date, mood value, and emoji are required' }, { status: 400 });
    }
    
    const [mood] = await sql`
      INSERT INTO mood_entries (user_id, entry_date, mood_value, mood_emoji, notes)
      VALUES (${userId}, ${date}, ${moodValue}, ${moodEmoji}, ${notes || ''})
      ON CONFLICT (user_id, entry_date) 
      DO UPDATE SET mood_value = ${moodValue}, mood_emoji = ${moodEmoji}, notes = ${notes || ''}
      RETURNING *
    `;
    
    return Response.json({ mood });
  } catch (error) {
    console.error('Error saving mood entry:', error);
    return Response.json({ error: 'Failed to save mood entry' }, { status: 500 });
  }
}