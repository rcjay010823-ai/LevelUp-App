import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (date) {
      // Get entry for specific date
      const [entry] = await sql`
        SELECT * FROM journal_entries 
        WHERE user_id = ${userId} AND entry_date = ${date}
      `;
      return Response.json({ entry: entry || null });
    } else {
      // Get recent entries for history
      const entries = await sql`
        SELECT * FROM journal_entries 
        WHERE user_id = ${userId}
        ORDER BY entry_date DESC
        LIMIT 30
      `;
      return Response.json({ entries });
    }
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return Response.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, date, content } = await request.json();
    
    if (!userId || !date) {
      return Response.json({ error: 'User ID and date are required' }, { status: 400 });
    }
    
    // Upsert logic - insert or update if exists
    const [entry] = await sql`
      INSERT INTO journal_entries (user_id, entry_date, content)
      VALUES (${userId}, ${date}, ${content || ''})
      ON CONFLICT (user_id, entry_date) 
      DO UPDATE SET 
        content = EXCLUDED.content,
        created_at = CASE 
          WHEN journal_entries.content IS NULL OR journal_entries.content = ''
          THEN CURRENT_TIMESTAMP 
          ELSE journal_entries.created_at 
        END
      RETURNING *
    `;
    
    return Response.json({ entry });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return Response.json({ error: 'Failed to save journal entry' }, { status: 500 });
  }
}