import { upload } from "@/app/api/utils/upload";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    console.log("Upload request content-type:", contentType);

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload from React Native
      try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
          console.error("No file provided in FormData");
          return Response.json({ error: "No file provided" }, { status: 400 });
        }

        console.log("File received:", file.name, file.type, file.size);

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log("Buffer created, size:", buffer.length);

        const result = await upload({ buffer });
        console.log("Upload result:", result);
        return Response.json(result);
      } catch (formError) {
        console.error("FormData processing error:", formError);
        return Response.json(
          { error: "Failed to process form data" },
          { status: 400 },
        );
      }
    } else if (contentType?.includes("application/json")) {
      // Handle URL or base64 upload
      try {
        const body = await request.json();

        if (body.url) {
          const result = await upload({ url: body.url });
          return Response.json(result);
        } else if (body.base64) {
          const result = await upload({ base64: body.base64 });
          return Response.json(result);
        } else {
          return Response.json(
            { error: "Invalid request body" },
            { status: 400 },
          );
        }
      } catch (jsonError) {
        console.error("JSON processing error:", jsonError);
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
      }
    } else if (contentType?.includes("application/octet-stream")) {
      // Handle buffer upload
      try {
        const buffer = Buffer.from(await request.arrayBuffer());
        const result = await upload({ buffer });
        return Response.json(result);
      } catch (bufferError) {
        console.error("Buffer processing error:", bufferError);
        return Response.json(
          { error: "Failed to process buffer" },
          { status: 400 },
        );
      }
    } else {
      console.error("Unsupported content type:", contentType);
      return Response.json(
        { error: "Unsupported content type" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Upload failed", details: error.message },
      { status: 500 },
    );
  }
}
