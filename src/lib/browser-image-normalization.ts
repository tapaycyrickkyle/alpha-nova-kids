"use client";

const OUTPUT_CANVAS_SIZE = 1024;
const CONTENT_PADDING_RATIO = 0.12;
const ALPHA_THRESHOLD = 8;

type NormalizeImageOptions = {
  canvasSize?: number;
  paddingRatio?: number;
};

type ThumbnailImageOptions = {
  maxDimension?: number;
  quality?: number;
};

type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to read the selected image."));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to prepare the selected image."));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}

function findOpaqueBounds(imageData: ImageData): Bounds | null {
  const { data, width, height } = imageData;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha <= ALPHA_THRESHOLD) {
        continue;
      }

      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right === -1 || bottom === -1) {
    return null;
  }

  return { left, top, right, bottom };
}

function buildNormalizedFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName}-normalized.png`;
}

function buildThumbnailFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName}-thumbnail.webp`;
}

export async function normalizeImageForCardUpload(
  file: File,
  options: NormalizeImageOptions = {},
) {
  const canvasSize = options.canvasSize ?? OUTPUT_CANVAS_SIZE;
  const paddingRatio = options.paddingRatio ?? CONTENT_PADDING_RATIO;
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(sourceUrl);
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;

    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!sourceContext) {
      throw new Error("Unable to process the selected image.");
    }

    sourceContext.drawImage(image, 0, 0);

    const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const bounds = findOpaqueBounds(imageData) ?? {
      left: 0,
      top: 0,
      right: sourceCanvas.width - 1,
      bottom: sourceCanvas.height - 1,
    };

    const croppedWidth = Math.max(1, bounds.right - bounds.left + 1);
    const croppedHeight = Math.max(1, bounds.bottom - bounds.top + 1);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = canvasSize;
    outputCanvas.height = canvasSize;

    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) {
      throw new Error("Unable to process the selected image.");
    }

    const drawableSize = canvasSize * (1 - paddingRatio * 2);
    const scale = Math.min(drawableSize / croppedWidth, drawableSize / croppedHeight);
    const targetWidth = croppedWidth * scale;
    const targetHeight = croppedHeight * scale;
    const targetX = (canvasSize - targetWidth) / 2;
    const targetY = (canvasSize - targetHeight) / 2;

    outputContext.clearRect(0, 0, canvasSize, canvasSize);
    outputContext.drawImage(
      sourceCanvas,
      bounds.left,
      bounds.top,
      croppedWidth,
      croppedHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight,
    );

    const normalizedBlob = await canvasToBlob(outputCanvas, "image/png");
    return new File([normalizedBlob], buildNormalizedFileName(file.name), {
      type: "image/png",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export async function createThumbnailImageForUpload(
  file: File,
  options: ThumbnailImageOptions = {},
) {
  const maxDimension = options.maxDimension ?? 384;
  const quality = options.quality ?? 0.82;
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(sourceUrl);
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight, 1);
    const scale = Math.min(1, maxDimension / longestSide);
    const targetWidth = Math.max(1, Math.round(image.naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(image.naturalHeight * scale));

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;

    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) {
      throw new Error("Unable to prepare the image thumbnail.");
    }

    outputContext.drawImage(image, 0, 0, targetWidth, targetHeight);

    const thumbnailBlob = await canvasToBlob(outputCanvas, "image/webp", quality);
    return new File([thumbnailBlob], buildThumbnailFileName(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
