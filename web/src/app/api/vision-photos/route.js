import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Ensure user can only access their own photos
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const photos = await sql`
      SELECT id, user_id, image_url, caption, created_at 
      FROM vision_photos 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 15
    `;

    return Response.json({ photos });
  } catch (error) {
    console.error("Error fetching vision photos:", error);
    return Response.json(
      { error: "Failed to fetch vision photos" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, imageUrl, caption } = await request.json();

    // Ensure user can only add photos to their own account
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!imageUrl) {
      return Response.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Check if user already has 15 photos
    const [countResult] = await sql`
      SELECT COUNT(*) as count 
      FROM vision_photos 
      WHERE user_id = ${userId}
    `;

    if (parseInt(countResult.count) >= 15) {
      return Response.json(
        { error: "Limit reached: You can upload up to 15 photos." },
        { status: 400 },
      );
    }

    const [photo] = await sql`
      INSERT INTO vision_photos (user_id, image_url, caption)
      VALUES (${userId}, ${imageUrl}, ${caption || ""})
      RETURNING id, user_id, image_url, caption, created_at
    `;

    return Response.json({ photo });
  } catch (error) {
    console.error("Error creating vision photo:", error);
    return Response.json(
      { error: "Failed to create vision photo" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, userId, caption } = await request.json();

    // Ensure user can only edit their own photos
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!id) {
      return Response.json({ error: "Photo ID is required" }, { status: 400 });
    }

    const [updatedPhoto] = await sql`
      UPDATE vision_photos 
      SET caption = ${caption || ""}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, user_id, image_url, caption, created_at
    `;

    if (!updatedPhoto) {
      return Response.json(
        { error: "Photo not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json({ photo: updatedPhoto });
  } catch (error) {
    console.error("Error updating vision photo:", error);
    return Response.json(
      { error: "Failed to update vision photo" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    // Ensure user can only delete their own photos
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!id) {
      return Response.json({ error: "Photo ID is required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const [deletedPhoto] = await sql`
      DELETE FROM vision_photos 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING image_url
    `;

    if (!deletedPhoto) {
      return Response.json(
        { error: "Photo not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, imageUrl: deletedPhoto.image_url });
  } catch (error) {
    console.error("Error deleting vision photo:", error);
    return Response.json(
      { error: "Failed to delete vision photo" },
      { status: 500 },
    );
  }
}
