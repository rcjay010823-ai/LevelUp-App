import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT 
        event_reminders,
        water_reminders,
        reflection_reminders,
        affirmation_reminders,
        reminder_times,
        active_affirmation_text,
        active_affirmation_source,
        user_timezone
      FROM notification_settings 
      WHERE user_id = ${userId}
    `;

    const settings = rows[0] || {
      event_reminders: true,
      water_reminders: true,
      reflection_reminders: true,
      affirmation_reminders: true,
      reminder_times: {"water": ["10:00", "14:00", "18:00"], "reflection": ["20:00"], "affirmation": ["08:00"]},
      active_affirmation_text: null,
      active_affirmation_source: 'library',
      user_timezone: 'device'
    };

    return Response.json({ settings });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return Response.json({ error: 'Failed to fetch user settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, activeAffirmationText, activeAffirmationSource, userTimezone } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // First check if settings exist for this user
    const existingRows = await sql`
      SELECT id FROM notification_settings WHERE user_id = ${userId}
    `;

    if (existingRows.length === 0) {
      // Create new settings record
      await sql`
        INSERT INTO notification_settings (
          user_id, 
          active_affirmation_text, 
          active_affirmation_source,
          user_timezone
        ) VALUES (
          ${userId}, 
          ${activeAffirmationText}, 
          ${activeAffirmationSource || 'library'},
          ${userTimezone || 'device'}
        )
      `;
    } else {
      // Update existing settings
      const updateFields = [];
      const updateValues = [];
      
      if (activeAffirmationText !== undefined) {
        updateFields.push('active_affirmation_text = $' + (updateValues.length + 2));
        updateValues.push(activeAffirmationText);
      }
      
      if (activeAffirmationSource !== undefined) {
        updateFields.push('active_affirmation_source = $' + (updateValues.length + 2));
        updateValues.push(activeAffirmationSource);
      }
      
      if (userTimezone !== undefined) {
        updateFields.push('user_timezone = $' + (updateValues.length + 2));
        updateValues.push(userTimezone);
      }

      if (updateFields.length > 0) {
        const query = `UPDATE notification_settings SET ${updateFields.join(', ')} WHERE user_id = $1`;
        await sql(query, [userId, ...updateValues]);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return Response.json({ error: 'Failed to update user settings' }, { status: 500 });
  }
}