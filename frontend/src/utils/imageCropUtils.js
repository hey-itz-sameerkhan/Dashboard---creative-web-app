// client/src/utils/imageCropUtils.js

/**
 * Cropped area details ka use karke ek new high-quality image file (Blob) generate karta hai.
 * Yeh function canvas API ka use karke cropping aur image quality adjustment karta hai.
 * * @param {string} imageSrc - The image URL (base64 ya object URL).
 * @param {object} pixelCrop - The cropped area in pixels: {x, y, width, height}.
 * @returns {Promise<Blob>} A promise that resolves with the cropped image Blob.
 */
export const getCroppedImage = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // ⭐ FIX 1: Cross-Origin: Agar image kisi alag domain se aa rahi ho, toh CORS error se bachne ke liye zaroori.
    image.crossOrigin = "anonymous"; 
    image.src = imageSrc;
    
    // Canvas setup: Cropped area ke dimensions ke barabar
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas 2D context mil nahi paya.'));
      return;
    }

    // Image load hone par cropping shuru karein
    image.onload = () => {
      // drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)
      ctx.drawImage(
        image,
        // Source (Jahan se cut karna hai)
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        // Destination (Canvas par kahan paste karna hai)
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Canvas se Blob (file-like object) generate karna
      // ⭐ FIX 2: Output format JPEG aur quality 0.95 (High Quality) set kiya.
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas se Blob generate nahi ho paya.'));
            return;
          }
          // Blob ko resolve karein, jise hum aage server par upload karenge
          resolve(blob);
        },
        'image/jpeg', // Output format
        0.95 // Output quality (0 to 1, 0.95 is excellent)
      );
    };

    // Image error handling
    image.onerror = () => {
      reject(new Error('Image load karne mein error aayi. Source: ' + imageSrc));
    };
    
    image.onabort = () => {
        reject(new Error('Image loading process cancel ho gaya.'));
    };
  });
};
