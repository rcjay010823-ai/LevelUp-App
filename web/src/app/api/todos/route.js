import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const userId = searchParams.get("userId");

    // Ensure user can only access their own todos
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!date) {
      return Response.json(
        { error: "Date parameter is required" },
        { status: 400 },
      );
    }

    const todos = await sql`
      SELECT id, title, todo_date, completed 
      FROM todos 
      WHERE todo_date = ${date} AND user_id = ${userId}
      ORDER BY created_at ASC
    `;

    return Response.json({ todos });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return Response.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, todo_date, userId } = await request.json();

    // Ensure user can only create todos for themselves
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (!title || !todo_date) {
      return Response.json(
        { error: "Title and date are required" },
        { status: 400 },
      );
    }

    const [todo] = await sql`
      INSERT INTO todos (title, todo_date, completed, user_id)
      VALUES (${title}, ${todo_date}, false, ${userId})
      RETURNING id, title, todo_date, completed
    `;

    return Response.json({ todo });
  } catch (error) {
    console.error("Error creating todo:", error);
    return Response.json({ error: "Failed to create todo" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, completed, userId } = await request.json();

    // Ensure user can only update their own todos
    if (!userId || userId !== session.user.id) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (id === undefined || completed === undefined) {
      return Response.json(
        { error: "ID and completed status are required" },
        { status: 400 },
      );
    }

    const [todo] = await sql`
      UPDATE todos 
      SET completed = ${completed}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, title, todo_date, completed
    `;

    if (!todo) {
      return Response.json(
        { error: "Todo not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json({ todo });
  } catch (error) {
    console.error("Error updating todo:", error);
    return Response.json({ error: "Failed to update todo" }, { status: 500 });
  }
}
