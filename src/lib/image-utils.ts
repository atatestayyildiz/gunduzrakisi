/**
 * Client-side WebP image optimizer to keep Firestore documents ultra-lightweight.
 * Automatically scales down large camera/phone photos and compresses into WebP.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  sizeKB: number;
  originalSizeKB: number;
  width: number;
  height: number;
}

export async function convertToWebP(
  file: File,
  maxWidth = 800,
  maxHeight = 1200,
  quality = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKB = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Görsel yüklenemedi."));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context oluşturulamadı."));
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first; if browser doesn't support, canvas returns PNG or fallback
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Estimate dataUrl size in KB (approx: base64 len * 0.75 / 1024)
        const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeKB = Math.round(sizeInBytes / 1024);

        resolve({
          dataUrl,
          sizeKB,
          originalSizeKB,
          width,
          height,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
