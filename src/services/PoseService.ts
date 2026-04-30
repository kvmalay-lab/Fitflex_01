/**
 * PoseService — encapsulates the lifecycle of the MediaPipe Tasks Vision
 * PoseLandmarker so React hooks no longer have to know about FilesetResolver,
 * model URLs, or close()-on-unmount semantics.
 *
 * Singleton-friendly: callers do `await poseService.initialize()`, then
 * `poseService.detect(video, ts)`, and `poseService.destroy()` on teardown.
 */

import {
  FilesetResolver,
  PoseLandmarker,
  PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';

export class PoseService {
  private landmarker: PoseLandmarker | null = null;
  private initPromise: Promise<void> | null = null;

  /** Idempotent. Repeated calls return the same in-flight promise. */
  async initialize(): Promise<void> {
    if (this.landmarker) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const lm = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      this.landmarker = lm;
    })();

    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  isReady(): boolean {
    return this.landmarker != null;
  }

  /** Run inference on a single video frame. Returns null if not initialized. */
  detect(video: HTMLVideoElement, timestampMs: number): PoseLandmarkerResult | null {
    if (!this.landmarker) return null;
    return this.landmarker.detectForVideo(video, timestampMs);
  }

  /** Tear down. Safe to call multiple times. */
  destroy(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        /* ignore */
      }
      this.landmarker = null;
    }
  }
}

/** Module-level singleton — cheap to import everywhere; lazy initialized. */
export const poseService = new PoseService();
