/**
 * YOLO Detection Service
 * Lazy-loads YOLO model for license plate detection
 * Falls back to OCR-only if no model available
 */

import * as ort from "onnxruntime-web";

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
};

type DetectionResult = {
  boxes: BoundingBox[];
  processingTime: number;
};

// Configure ONNX Runtime to use WASM backend
ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;

export class YoloDetector {
  private session: ort.InferenceSession | null = null;
  private isLoading = false;
  private modelPath: string;
  private inputSize = 640;
  private confidenceThreshold = 0.5;
  private iouThreshold = 0.45;

  constructor(modelPath: string = "/models/license-plate-yolov8n.onnx") {
    this.modelPath = modelPath;
  }

  /**
   * Lazy load YOLO model
   * Only loads when called, not on app startup
   */
  async loadModel(): Promise<boolean> {
    if (this.session) return true;
    if (this.isLoading) return false;

    this.isLoading = true;

    try {
      console.log("[YOLO] Loading model from:", this.modelPath);

      // Check if model file exists
      const response = await fetch(this.modelPath, { method: "HEAD" });
      if (!response.ok) {
        console.log("[YOLO] Model file not found, using OCR-only mode");
        this.isLoading = false;
        return false;
      }

      // Load model
      this.session = await ort.InferenceSession.create(this.modelPath, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });

      console.log("[YOLO] Model loaded successfully");
      this.isLoading = false;
      return true;
    } catch (error) {
      console.log("[YOLO] Failed to load model:", error);
      this.isLoading = false;
      return false;
    }
  }

  /**
   * Check if model is loaded
   */
  isLoaded(): boolean {
    return this.session !== null;
  }

  /**
   * Check if model is loading
   */
  isModelLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Preprocess image for YOLO input
   */
  private preprocessImage(
    imageData: ImageData
  ): { tensor: ort.Tensor; originalSize: { width: number; height: number } } {
    const { width, height, data } = imageData;

    // Resize to input size
    const canvas = document.createElement("canvas");
    canvas.width = this.inputSize;
    canvas.height = this.inputSize;
    const ctx = canvas.getContext("2d")!;

    // Draw resized image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.drawImage(tempCanvas, 0, 0, this.inputSize, this.inputSize);

    // Get pixel data
    const resizedData = ctx.getImageData(0, 0, this.inputSize, this.inputSize);
    const pixels = resizedData.data;

    // Convert to float tensor [1, 3, 640, 640] (NCHW format)
    const float32Data = new Float32Array(3 * this.inputSize * this.inputSize);

    for (let i = 0; i < this.inputSize * this.inputSize; i++) {
      const pixelIndex = i * 4;
      // Normalize to [0, 1] and convert RGB to CHW
      float32Data[i] = pixels[pixelIndex] / 255.0; // R
      float32Data[i + this.inputSize * this.inputSize] =
        pixels[pixelIndex + 1] / 255.0; // G
      float32Data[i + 2 * this.inputSize * this.inputSize] =
        pixels[pixelIndex + 2] / 255.0; // B
    }

    const tensor = new ort.Tensor("float32", float32Data, [
      1,
      3,
      this.inputSize,
      this.inputSize,
    ]);

    return { tensor, originalSize: { width, height } };
  }

  /**
   * Run YOLO detection on image
   */
  async detect(imageData: ImageData): Promise<DetectionResult> {
    const startTime = performance.now();

    if (!this.session) {
      return { boxes: [], processingTime: performance.now() - startTime };
    }

    try {
      const { tensor, originalSize } = this.preprocessImage(imageData);

      // Run inference
      const inputName = this.session.inputNames[0];
      const results = await this.session.run({ [inputName]: tensor });

      // Get output
      const outputName = this.session.outputNames[0];
      const output = results[outputName];

      // Process output
      const boxes = this.postprocessOutput(output, originalSize);

      return {
        boxes,
        processingTime: performance.now() - startTime,
      };
    } catch (error) {
      console.error("[YOLO] Detection error:", error);
      return { boxes: [], processingTime: performance.now() - startTime };
    }
  }

  /**
   * Post-process YOLO output
   */
  private postprocessOutput(
    output: ort.Tensor,
    originalSize: { width: number; height: number }
  ): BoundingBox[] {
    const data = output.data as Float32Array;
    const boxes: BoundingBox[] = [];

    // YOLOv8 output format: [1, 84, 8400]
    // 84 = 4 (bbox) + 80 (classes)
    // For license plate, we typically have 1 class

    const numDetections = 8400;
    const numClasses = 80; // COCO classes (we'll filter for vehicles)

    for (let i = 0; i < numDetections; i++) {
      // Get bounding box
      const x = data[i];
      const y = data[i + numDetections];
      const w = data[i + 2 * numDetections];
      const h = data[i + 3 * numDetections];

      // Get class scores
      let maxScore = 0;
      let maxClassIdx = 0;
      for (let j = 0; j < numClasses; j++) {
        const score = data[i + (4 + j) * numDetections];
        if (score > maxScore) {
          maxScore = score;
          maxClassIdx = j;
        }
      }

      // Filter: keep only vehicles (car=2, motorcycle=3, bus=5, truck=7)
      // and confidence > threshold
      const vehicleClasses = [2, 3, 5, 7]; // COCO class indices
      if (
        maxScore > this.confidenceThreshold &&
        vehicleClasses.includes(maxClassIdx)
      ) {
        // Convert to original size
        const scaleX = originalSize.width / this.inputSize;
        const scaleY = originalSize.height / this.inputSize;

        boxes.push({
          x: x * scaleX,
          y: y * scaleY,
          width: w * scaleX,
          height: h * scaleY,
          confidence: maxScore,
          class: this.getClassName(maxClassIdx),
        });
      }
    }

    // Apply NMS
    return this.nonMaxSuppression(boxes);
  }

  /**
   * Non-maximum suppression
   */
  private nonMaxSuppression(boxes: BoundingBox[]): BoundingBox[] {
    if (boxes.length === 0) return [];

    // Sort by confidence
    boxes.sort((a, b) => b.confidence - a.confidence);

    const result: BoundingBox[] = [];
    const used = new Set<number>();

    for (let i = 0; i < boxes.length; i++) {
      if (used.has(i)) continue;

      result.push(boxes[i]);

      for (let j = i + 1; j < boxes.length; j++) {
        if (used.has(j)) continue;

        if (this.calculateIoU(boxes[i], boxes[j]) > this.iouThreshold) {
          used.add(j);
        }
      }
    }

    return result;
  }

  /**
   * Calculate Intersection over Union
   */
  private calculateIoU(a: BoundingBox, b: BoundingBox): number {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const union = areaA + areaB - intersection;

    return intersection / union;
  }

  /**
   * Get class name from index
   */
  private getClassName(index: number): string {
    const classNames: Record<number, string> = {
      2: "car",
      3: "motorcycle",
      5: "bus",
      7: "truck",
    };
    return classNames[index] || "vehicle";
  }

  /**
   * Dispose model
   */
  dispose(): void {
    if (this.session) {
      this.session.release();
      this.session = null;
    }
  }
}

// Singleton instance
let detectorInstance: YoloDetector | null = null;

/**
 * Get or create YOLO detector instance
 */
export function getYoloDetector(): YoloDetector {
  if (!detectorInstance) {
    detectorInstance = new YoloDetector();
  }
  return detectorInstance;
}

/**
 * Lazy load YOLO model
 */
export async function loadYoloModel(): Promise<boolean> {
  const detector = getYoloDetector();
  return detector.loadModel();
}
