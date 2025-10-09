import * as React from "react";
import * as ImageManipulator from "expo-image-manipulator";

// Use relative URLs for API calls - this will work with both dev and published environments
const API_BASE_URL = "";

function useUpload() {
  const [loading, setLoading] = React.useState(false);

  const upload = React.useCallback(async (input) => {
    try {
      setLoading(true);

      if ("reactNativeAsset" in input && input.reactNativeAsset) {
        // For React Native assets, process and compress the image
        const asset = input.reactNativeAsset;

        try {
          console.log("Starting upload process with asset:", {
            uri: asset.uri,
            type: asset.type || asset.mimeType,
            size: asset.fileSize,
            fileName: asset.fileName,
          });

          // Validate asset first
          if (!asset || !asset.uri) {
            throw new Error(
              "No image selected. Please try selecting an image again.",
            );
          }

          // Check file size and compress if necessary
          let processedUri = asset.uri;
          let mimeType = asset.mimeType || asset.type || "image/jpeg";
          let fileSize = asset.fileSize;

          // If file is large or we want to ensure compatibility, compress it
          if (
            !fileSize ||
            fileSize > 5 * 1024 * 1024 ||
            asset.width > 2048 ||
            asset.height > 2048
          ) {
            console.log("Compressing image for upload...");

            try {
              const compressedImage = await ImageManipulator.manipulateAsync(
                asset.uri,
                [
                  // Resize if too large
                  ...(asset.width > 2048 || asset.height > 2048
                    ? [{ resize: { width: 2048, height: 2048 } }]
                    : []),
                ],
                {
                  compress: 0.8, // 80% quality
                  format: ImageManipulator.SaveFormat.JPEG,
                },
              );

              processedUri = compressedImage.uri;
              mimeType = "image/jpeg";

              console.log("Compressed image info:", {
                originalSize: fileSize,
                compressedUri: processedUri,
              });
            } catch (compressionError) {
              console.warn(
                "Image compression failed, proceeding with original:",
                compressionError,
              );
              // If compression fails, proceed with original
            }
          }

          // Read the file as base64 using fetch API
          console.log("Reading file as base64...");

          let finalBase64;
          try {
            // Use fetch to read the file and convert to base64
            const response = await fetch(processedUri);
            const blob = await response.blob();

            finalBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                // Remove data URL prefix if present (data:image/jpeg;base64,)
                const base64Data = result.includes(",")
                  ? result.split(",")[1]
                  : result;
                resolve(base64Data);
              };
              reader.onerror = () => reject(new Error("Failed to read file"));
              reader.readAsDataURL(blob);
            });
          } catch (readError) {
            console.error("Failed to read file as base64:", readError);
            throw new Error(
              "Failed to read image data. The image might be corrupted.",
            );
          }

          if (!finalBase64 || finalBase64.length === 0) {
            throw new Error(
              "Failed to read image data. The image might be corrupted.",
            );
          }

          console.log("Successfully read base64, length:", finalBase64.length);

          // Create data URI
          const dataUri = `data:${mimeType};base64,${finalBase64}`;

          console.log("Uploading to API...");

          // Add timeout and better error handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds for large uploads

          // Try the upload API endpoint
          const uploadUrl = `${API_BASE_URL}/api/upload`;
          console.log("Making request to:", uploadUrl);

          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ base64: dataUri }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log("API response status:", response.status);
          console.log(
            "API response headers:",
            Object.fromEntries(response.headers.entries()),
          );

          if (!response.ok) {
            let errorText;
            try {
              const errorData = await response.json();
              errorText =
                errorData.error || errorData.message || response.statusText;
            } catch {
              errorText = response.statusText || "Unknown error";
            }
            console.error("Upload API failed:", errorText);

            if (response.status === 413) {
              throw new Error(
                "Image is too large for upload. Please try a smaller image.",
              );
            }
            if (response.status === 408 || response.status === 504) {
              throw new Error(
                "Upload timed out. Please check your internet connection and try again.",
              );
            }
            if (response.status === 500) {
              throw new Error("Server error. Please try again later.");
            }
            if (response.status === 404) {
              throw new Error(
                "Upload service not found. Please make sure the app is properly configured.",
              );
            }
            if (response.status === 0 || !response.status) {
              throw new Error(
                "Network error. Please check your internet connection.",
              );
            }
            throw new Error(
              `Upload failed: ${errorText} (Status: ${response.status})`,
            );
          }

          const data = await response.json();
          console.log("Upload successful:", data);

          if (!data.url) {
            throw new Error(
              "Upload succeeded but no URL was returned from the server.",
            );
          }

          return { url: data.url, mimeType: data.mimeType || mimeType };
        } catch (fileError) {
          console.error("Detailed error in file processing:", fileError);
          console.error("Error name:", fileError.name);
          console.error("Error message:", fileError.message);
          console.error("Error stack:", fileError.stack);

          if (fileError.name === "AbortError") {
            throw new Error(
              "Upload timed out. Please check your internet connection and try again.",
            );
          }

          // Check for network errors
          if (
            fileError.name === "TypeError" &&
            fileError.message.includes("Network request failed")
          ) {
            throw new Error(
              "Network error. Please check your internet connection and try again.",
            );
          }

          // Check for specific file system errors
          if (
            fileError.message.includes("No such file") ||
            fileError.message.includes("not found")
          ) {
            throw new Error(
              "Image file not found. Please try selecting the image again.",
            );
          }

          if (
            fileError.message.includes("Permission denied") ||
            fileError.message.includes("access")
          ) {
            throw new Error(
              "Permission denied. Please allow the app to access your photos.",
            );
          }

          if (
            fileError.message.includes("too large") ||
            fileError.message.includes("size")
          ) {
            throw new Error(
              "Image is too large. Please select a smaller image.",
            );
          }

          // For network/API errors, preserve the original message
          if (
            fileError.message.includes("Upload failed") ||
            fileError.message.includes("Server error") ||
            fileError.message.includes("Network error") ||
            fileError.message.includes("Upload service not found") ||
            fileError.message.includes("Upload succeeded but no URL")
          ) {
            throw fileError;
          }

          // If we have a specific error message, use it
          if (fileError.message && fileError.message.trim().length > 0) {
            throw new Error(`Image processing failed: ${fileError.message}`);
          }

          // Last resort - this should rarely happen now
          throw new Error(
            `Unexpected error during image processing: ${fileError.toString()}`,
          );
        }
      } else if ("url" in input) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: input.url }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const text = await response.text();
          console.error("Upload failed with response:", text);
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        return { url: data.url, mimeType: data.mimeType || null };
      } else if ("base64" in input) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ base64: input.base64 }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const text = await response.text();
          console.error("Upload failed with response:", text);
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        return { url: data.url, mimeType: data.mimeType || null };
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ buffer: input.buffer }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const text = await response.text();
          console.error("Upload failed with response:", text);
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        return { url: data.url, mimeType: data.mimeType || null };
      }
    } catch (uploadError) {
      console.error("Top-level upload error:", uploadError);

      if (uploadError.name === "AbortError") {
        return {
          error:
            "Upload timed out. Please check your internet connection and try again.",
        };
      }

      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }

      if (typeof uploadError === "string") {
        return { error: uploadError };
      }

      return { error: `Upload failed: ${uploadError.toString()}` };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;
