/**
 * Compress an image file to reduce bandwidth usage
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 1200px)
 * @param maxHeight - Maximum height (default: 1200px)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Compressed image as a new File object
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            );
            
            console.log(
              `Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
            );
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Get estimated file size after compression
 */
export const getEstimatedCompressedSize = (originalSize: number): string => {
  // Approximate 60-70% reduction
  const estimated = originalSize * 0.35;
  if (estimated < 1024) {
    return `~${Math.round(estimated)} bytes`;
  } else if (estimated < 1024 * 1024) {
    return `~${(estimated / 1024).toFixed(1)} KB`;
  }
  return `~${(estimated / 1024 / 1024).toFixed(2)} MB`;
};
