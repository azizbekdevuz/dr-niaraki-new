// Optimized shimmer placeholder for better performance than base64 blur
export const createShimmerPlaceholder = (width: number = 400, height: number = 400) => {
  const shimmer = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#1f2937" offset="20%" />
          <stop stop-color="#374151" offset="50%" />
          <stop stop-color="#1f2937" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#1f2937" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" opacity="0.5" />
      <animateTransform attributeName="transform" type="translate" values="-${width} 0; ${width} 0; ${width} 0" dur="1s" repeatCount="indefinite" />
    </svg>
  `;
  
  const buffer = Buffer.from(shimmer);
  return `data:image/svg+xml;base64,${buffer.toString('base64')}`;
};

// Lightweight placeholder for profile images
export const PROFILE_SHIMMER = createShimmerPlaceholder(400, 400);

// Optimized image props generator
export const getOptimizedImageProps = (
  src: string,
  alt: string,
  priority: boolean = false,
  sizes?: string
) => ({
  src,
  alt,
  fill: true,
  sizes: sizes || "(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 420px",
  className: "rounded-full transition-all duration-slow object-cover",
  priority,
  placeholder: "blur" as const,
  blurDataURL: PROFILE_SHIMMER,
});

// Constants for image optimization
export const IMAGE_CONSTANTS = {
  PROFILE_SIZES: "(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 420px",
  CARD_SIZES: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  HERO_SIZES: "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px",
} as const; 