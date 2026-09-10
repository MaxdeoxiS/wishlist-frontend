/**
 * Compresses and resizes an image file before upload to optimize transfer speed and storage.
 */
export async function compressImage(
    file: File,
    maxDimension = 1200,
    quality = 0.85
): Promise<File> {
    // If file is already small (e.g. < 100 KB), return directly
    if (file.size < 100 * 1024) {
        return file;
    }

    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let { width, height } = img;

            if (width <= maxDimension && height <= maxDimension && file.size < 250 * 1024) {
                resolve(file);
                return;
            }

            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(file);
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

            canvas.toBlob(
                (blob) => {
                    if (!blob || blob.size >= file.size) {
                        resolve(file);
                        return;
                    }
                    const compressedFile = new File([blob], file.name, {
                        type: outputType,
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                },
                outputType,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };

        img.src = objectUrl;
    });
}
