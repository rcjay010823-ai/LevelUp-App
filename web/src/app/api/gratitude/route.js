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
        SELECT * FROM gratitude_entries 
        WHERE user_id = ${userId} AND entry_date = ${date}
      `;
      return Response.json({ entry: entry || null });
    } else {
      // Get recent entries for history
      const entries = await sql`
        SELECT * FROM gratitude_entries 
        WHERE user_id = ${userId}
        ORDER BY entry_date DESC
        LIMIT 30
      `;
      return Response.json({ entries });
    }
  } catch (error) {
    console.error('Error fetching gratitude entries:', error);
    return Response.json({ error: 'Failed to fetch gratitude entries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, date, lookingForward, relationshipsGratefulFor, threeGratitudes } = await request.json();
    
    if (!userId || !date) {
      return Response.json({ error: 'User ID and date are required' }, { status: 400 });
    }
    
    // Upsert logic - insert or update if exists
    const [entry] = await sql`
      INSERT INTO gratitude_entries (user_id, entry_date, looking_forward, relationships_grateful_for, three_gratitudes)
      VALUES (${userId}, ${date}, ${lookingForward || ''}, ${relationshipsGratefulFor || ''}, ${threeGratitudes || ''})
      ON CONFLICT (user_id, entry_date) 
      DO UPDATE SET 
        looking_forward = EXCLUDED.looking_forward,
        relationships_grateful_for = EXCLUDED.relationships_grateful_for,
        three_gratitudes = EXCLUDED.three_gratitudes,
        created_at = CASE 
          WHEN gratitude_entries.looking_forward IS NULL AND gratitude_entries.relationships_grateful_for IS NULL AND gratitude_entries.three_gratitudes IS NULL 
          THEN CURRENT_TIMESTAMP 
          ELSE gratitude_entries.created_at 
        END
      RETURNING *
    `;
    
    return Response.json({ entry });
  } catch (error) {
    console.error('Error saving gratitude entry:', error);
    return Response.json({ error: 'Failed to save gratitude entry' }, { status: 500 });
  }
}