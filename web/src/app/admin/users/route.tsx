import sql from "@/app/api/utils/sql";

export async function loader() {
  try {
    console.log("[Admin Users SSR] Loading users...");

    // First, check if vision_photos table exists
    let hasVisionPhotos = false;
    try {
      await sql`SELECT 1 FROM vision_photos LIMIT 1`;
      hasVisionPhotos = true;
    } catch (e) {
      console.log("[Admin Users SSR] vision_photos table does not exist");
    }

    let users;
    let statsResult;

    if (hasVisionPhotos) {
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

      [statsResult] = await sql`
        SELECT
          COUNT(DISTINCT au.id) as total_users,
          COUNT(DISTINCT CASE WHEN vp.id IS NOT NULL THEN au.id END) as active_users,
          COUNT(vp.id) as total_photos
        FROM auth_users au
        LEFT JOIN vision_photos vp ON au.id::text = vp.user_id
      `;
    } else {
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

      [statsResult] = await sql`
        SELECT
          COUNT(au.id) as total_users,
          0 as active_users,
          0 as total_photos
        FROM auth_users au
      `;
    }

    const stats = {
      totalUsers: parseInt(statsResult.total_users) || 0,
      activeUsers: parseInt(statsResult.active_users) || 0,
      totalPhotos: parseInt(statsResult.total_photos) || 0
    };

    return {
      users: users.map(user => ({
        ...user,
        total_photos: parseInt(user.total_photos) || 0
      })),
      stats
    };
  } catch (error) {
    console.error("[Admin Users SSR] Error:", error);
    return {
      users: [],
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        totalPhotos: 0
      },
      error: error.message
    };
  }
}
