import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    let whereClause = 'WHERE user_id = $1';
    let params = [userId];
    
    if (year) {
      whereClause += ' AND year = $2';
      params.push(parseInt(year));
    }
    
    const goals = await sql(
      `SELECT * FROM yearly_goals ${whereClause} ORDER BY created_at DESC`,
      params
    );
    
    // Get sub-goals count for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const subGoals = await sql(
          'SELECT * FROM sub_goals WHERE goal_id = $1 AND user_id = $2 ORDER BY order_index ASC, created_at ASC',
          [goal.id, userId]
        );
        
        const totalSubGoals = subGoals.length;
        const completedSubGoals = subGoals.filter(sg => sg.is_done).length;
        
        return {
          ...goal,
          subGoalsCount: totalSubGoals,
          completedSubGoalsCount: completedSubGoals,
          progress: totalSubGoals > 0 ? completedSubGoals / totalSubGoals : 0
        };
      })
    );
    
    return Response.json({ goals: goalsWithProgress });
  } catch (error) {
    console.error('Error fetching yearly goals:', error);
    return Response.json({ error: 'Failed to fetch yearly goals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, title, notes, targetDate, year } = await request.json();
    
    if (!userId || !title || !year) {
      return Response.json({ error: 'User ID, title, and year are required' }, { status: 400 });
    }
    
    const [goal] = await sql`
      INSERT INTO yearly_goals (user_id, title, notes, target_date, year, is_done, created_at)
      VALUES (${userId}, ${title}, ${notes || ''}, ${targetDate || null}, ${year}, false, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    return Response.json({ goal });
  } catch (error) {
    console.error('Error creating yearly goal:', error);
    return Response.json({ error: 'Failed to create yearly goal' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, userId, title, notes, targetDate, isDone } = await request.json();
    
    if (!id || !userId) {
      return Response.json({ error: 'Goal ID and User ID are required' }, { status: 400 });
    }
    
    const [goal] = await sql`
      UPDATE yearly_goals 
      SET title = ${title}, notes = ${notes || ''}, target_date = ${targetDate || null}, is_done = ${isDone || false}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    
    if (!goal) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    return Response.json({ goal });
  } catch (error) {
    console.error('Error updating yearly goal:', error);
    return Response.json({ error: 'Failed to update yearly goal' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!id || !userId) {
      return Response.json({ error: 'Goal ID and User ID are required' }, { status: 400 });
    }
    
    // Delete sub-goals first (CASCADE should handle this, but being explicit)
    await sql`DELETE FROM sub_goals WHERE goal_id = ${id} AND user_id = ${userId}`;
    
    // Delete the goal
    const result = await sql`DELETE FROM yearly_goals WHERE id = ${id} AND user_id = ${userId}`;
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting yearly goal:', error);
    return Response.json({ error: 'Failed to delete yearly goal' }, { status: 500 });
  }
}