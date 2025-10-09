import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    console.log("[Admin Users API] Starting request...");

    // First, check if vision_photos table exists
    let hasVisionPhotos = false;
    try {
      await sql`SELECT 1 FROM vision_photos LIMIT 1`;
      hasVisionPhotos = true;
      console.log("[Admin Users API] vision_photos table exists");
    } catch (e) {
      console.log("[Admin Users API] vision_photos table does not exist, using basic query");
    }

    let users;
    let statsResult;

    if (hasVisionPhotos) {
      // Fetch users with their stats (with vision_photos)
      users = await sql`
        SELECT
          au.id as user_id,
          au.name,
          au.email,
          au."emailVerified",
          au.image,
          COUNT(vp.id) as total_photos,
          MAX(vp.created_at) as last_activity
        FROM auth_users au
        LEFT JOIN vision_photos vp ON au.id::text = vp.user_id
        GROUP BY au.id, au.name, au.email, au."emailVerified", au.image
        ORDER BY au.id DESC
      `;

      // Calculate overall stats
      [statsResult] = await sql`
        SELECT
          COUNT(DISTINCT au.id) as total_users,
          COUNT(DISTINCT CASE WHEN vp.id IS NOT NULL THEN au.id END) as active_users,
          COUNT(vp.id) as total_photos
        FROM auth_users au
        LEFT JOIN vision_photos vp ON au.id::text = vp.user_id
      `;
    } else {
      // Fetch users without vision_photos (simpler query)
      users = await sql`
        SELECT
          au.id as user_id,
          au.name,
          au.email,
          au."emailVerified",
          au.image,
          0 as total_photos,
          NULL as last_activity
        FROM auth_users au
        ORDER BY au.id DESC
      `;

      // Calculate basic stats
      [statsResult] = await sql`
        SELECT
          COUNT(au.id) as total_users,
          0 as active_users,
          0 as total_photos
        FROM auth_users au
      `;
    }

    console.log(`[Admin Users API] Fetched ${users.length} users`);

    const stats = {
      totalUsers: parseInt(statsResult.total_users) || 0,
      activeUsers: parseInt(statsResult.active_users) || 0,
      totalPhotos: parseInt(statsResult.total_photos) || 0
    };

    console.log("[Admin Users API] Stats calculated:", stats);

    const response = {
      users: users.map(user => ({
        ...user,
        total_photos: parseInt(user.total_photos) || 0
      })),
      stats
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("[Admin Users API] Error:", error);
    console.error("[Admin Users API] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return new Response(JSON.stringify({
      error: "Failed to fetch users",
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Optional: Add basic auth protection for admin routes
export async function POST(request) {
  return Response.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}