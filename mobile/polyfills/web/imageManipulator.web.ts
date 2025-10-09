// Web polyfill for expo-image-manipulator
// On web, we'll use Canvas API for image manipulation

export enum SaveFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
}

export enum FlipType {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

interface ManipulateAction {
  resize?: { width?: number; height?: number };
  rotate?: number;
  flip?: FlipType;
  crop?: { originX: number; originY: number; width: number; height: number };
}

interface SaveOptions {
  compress?: number;
  format?: SaveFormat;
  base64?: boolean;
}

interface ManipulateResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

async function manipulateAsync(
  uri: string,
  actions: ManipulateAction[] = [],
  saveOptions: SaveOptions = {}
): Promise<ManipulateResult> {
  // On web, for now we'll just return the original URI
  // since the actual compression/manipulation happens server-side
  // or is handled by the browser's native file handling

  // In a production app, you might want to implement Canvas-based manipulation here
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback: return original if canvas not available
          resolve({
            uri,
            width: img.width,
            height: img.height,
          });
          return;
        }

        let width = img.width;
        let height = img.height;

        // Apply resize action if present
        for (const action of actions) {
          if (action.resize) {
            if (action.resize.width) width = action.resize.width;
            if (action.resize.height) height = action.resize.height;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the image with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to desired format
        const format = saveOptions.format || SaveFormat.JPEG;
        const quality = saveOptions.compress !== undefined ? saveOptions.compress : 0.8;
        const mimeType = `image/${format}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }

            const resultUri = URL.createObjectURL(blob);
            resolve({
              uri: resultUri,
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = uri;
  });
}

export { manipulateAsync };
