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
      // Get affirmations for specific date
      const affirmations = await sql`
        SELECT * FROM affirmations 
        WHERE user_id = ${userId} AND entry_date = ${date}
        ORDER BY created_at ASC
      `;
      return Response.json({ affirmations });
    } else {
      // Get recent affirmations for history
      const affirmations = await sql`
        SELECT * FROM affirmations 
        WHERE user_id = ${userId}
        ORDER BY entry_date DESC, created_at ASC
        LIMIT 100
      `;
      return Response.json({ affirmations });
    }
  } catch (error) {
    console.error('Error fetching affirmations:', error);
    return Response.json({ error: 'Failed to fetch affirmations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, date, text } = await request.json();
    
    if (!userId || !date || !text?.trim()) {
      return Response.json({ error: 'User ID, date, and text are required' }, { status: 400 });
    }
    
    const [affirmation] = await sql`
      INSERT INTO affirmations (user_id, entry_date, text)
      VALUES (${userId}, ${date}, ${text.trim()})
      RETURNING *
    `;
    
    return Response.json({ affirmation });
  } catch (error) {
    console.error('Error saving affirmation:', error);
    return Response.json({ error: 'Failed to save affirmation' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!id || !userId) {
      return Response.json({ error: 'Affirmation ID and User ID are required' }, { status: 400 });
    }
    
    // Verify ownership before deleting
    const [deletedAffirmation] = await sql`
      DELETE FROM affirmations 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    
    if (!deletedAffirmation) {
      return Response.json({ error: 'Affirmation not found or unauthorized' }, { status: 404 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting affirmation:', error);
    return Response.json({ error: 'Failed to delete affirmation' }, { status: 500 });
  }
}