import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');
    const userId = searchParams.get('userId');
    
    if (!goalId || !userId) {
      return Response.json({ error: 'Goal ID and User ID are required' }, { status: 400 });
    }
    
    const subGoals = await sql`
      SELECT * FROM sub_goals 
      WHERE goal_id = ${goalId} AND user_id = ${userId}
      ORDER BY order_index ASC, created_at ASC
    `;
    
    return Response.json({ subGoals });
  } catch (error) {
    console.error('Error fetching sub-goals:', error);
    return Response.json({ error: 'Failed to fetch sub-goals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { goalId, userId, title, orderIndex } = await request.json();
    
    if (!goalId || !userId || !title) {
      return Response.json({ error: 'Goal ID, User ID, and title are required' }, { status: 400 });
    }
    
    // If no order index provided, get the next one
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined || finalOrderIndex === null) {
      const result = await sql`
        SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
        FROM sub_goals 
        WHERE goal_id = ${goalId} AND user_id = ${userId}
      `;
      finalOrderIndex = result[0]?.next_order || 1;
    }
    
    const [subGoal] = await sql`
      INSERT INTO sub_goals (goal_id, user_id, title, is_done, order_index, created_at)
      VALUES (${goalId}, ${userId}, ${title}, false, ${finalOrderIndex}, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    return Response.json({ subGoal });
  } catch (error) {
    console.error('Error creating sub-goal:', error);
    return Response.json({ error: 'Failed to create sub-goal' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, userId, title, isDone, orderIndex } = await request.json();
    
    if (!id || !userId) {
      return Response.json({ error: 'Sub-goal ID and User ID are required' }, { status: 400 });
    }
    
    let updateFields = [];
    let updateValues = [];
    let paramCount = 0;
    
    if (title !== undefined) {
      updateFields.push(`title = $${++paramCount}`);
      updateValues.push(title);
    }
    
    if (isDone !== undefined) {
      updateFields.push(`is_done = $${++paramCount}`);
      updateValues.push(isDone);
    }
    
    if (orderIndex !== undefined) {
      updateFields.push(`order_index = $${++paramCount}`);
      updateValues.push(orderIndex);
    }
    
    if (updateFields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    updateValues.push(id, userId);
    const whereClause = `WHERE id = $${++paramCount} AND user_id = $${++paramCount}`;
    
    const [subGoal] = await sql(
      `UPDATE sub_goals SET ${updateFields.join(', ')} ${whereClause} RETURNING *`,
      updateValues
    );
    
    if (!subGoal) {
      return Response.json({ error: 'Sub-goal not found' }, { status: 404 });
    }
    
    return Response.json({ subGoal });
  } catch (error) {
    console.error('Error updating sub-goal:', error);
    return Response.json({ error: 'Failed to update sub-goal' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!id || !userId) {
      return Response.json({ error: 'Sub-goal ID and User ID are required' }, { status: 400 });
    }
    
    const result = await sql`
      DELETE FROM sub_goals 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting sub-goal:', error);
    return Response.json({ error: 'Failed to delete sub-goal' }, { status: 500 });
  }
}