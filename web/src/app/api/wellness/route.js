import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return Response.json(
        { error: "Date parameter is required" },
        { status: 400 },
      );
    }

    const [wellness] = await sql`
      SELECT wellness_date, water_ml, steps, sleep_hours 
      FROM wellness 
      WHERE wellness_date = ${date}
    `;

    // Return default values if no record exists
    const result = wellness || {
      wellness_date: date,
      water_ml: 0,
      steps: 0,
      sleep_hours: 0.0,
    };

    return Response.json({ wellness: result });
  } catch (error) {
    console.error("Error fetching wellness data:", error);
    return Response.json(
      { error: "Failed to fetch wellness data" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { wellness_date, water_ml, steps, sleep_hours } =
      await request.json();

    if (!wellness_date) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    const [wellness] = await sql`
      INSERT INTO wellness (wellness_date, water_ml, steps, sleep_hours)
      VALUES (${wellness_date}, ${water_ml || 0}, ${steps || 0}, ${sleep_hours || 0.0})
      ON CONFLICT (wellness_date) 
      DO UPDATE SET 
        water_ml = EXCLUDED.water_ml,
        steps = EXCLUDED.steps,
        sleep_hours = EXCLUDED.sleep_hours
      RETURNING wellness_date, water_ml, steps, sleep_hours
    `;

    return Response.json({ wellness });
  } catch (error) {
    console.error("Error updating wellness data:", error);
    return Response.json(
      { error: "Failed to update wellness data" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { wellness_date, field, value } = await request.json();

    if (!wellness_date || !field || value === undefined) {
      return Response.json(
        { error: "Date, field, and value are required" },
        { status: 400 },
      );
    }

    // Validate field name
    const validFields = ["water_ml", "steps", "sleep_hours"];
    if (!validFields.includes(field)) {
      return Response.json({ error: "Invalid field name" }, { status: 400 });
    }

    // First, ensure a record exists for this date
    await sql`
      INSERT INTO wellness (wellness_date, water_ml, steps, sleep_hours)
      VALUES (${wellness_date}, 0, 0, 0.0)
      ON CONFLICT (wellness_date) DO NOTHING
    `;

    // Then update the specific field
    const [wellness] = await sql(
      `UPDATE wellness SET ${field} = $1 WHERE wellness_date = $2 RETURNING wellness_date, water_ml, steps, sleep_hours`,
      [value, wellness_date],
    );

    return Response.json({ wellness });
  } catch (error) {
    console.error("Error updating wellness field:", error);
    return Response.json(
      { error: "Failed to update wellness field" },
      { status: 500 },
    );
  }
}
