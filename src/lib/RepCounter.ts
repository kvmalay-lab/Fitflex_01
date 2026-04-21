/**
 * 5-Frame Confirmation State Machine.
 * Counts a rep only when the angle has been on the opposite side of its threshold
 * for >= CONFIRM_FRAMES consecutive frames. Prevents double-counting at boundaries.
 */

export type Stage = 'UP' | 'DOWN';

const CONFIRM_FRAMES = 5;

export class RepCounter {
  private low: number;
  private high: number;
  private state: Stage;
  private framesAtState: number = 0;
  public reps: number = 0;
  public lastTransitionAngle: number | null = null;

  constructor(low: number, high: number, startState: Stage = 'UP') {
    this.low = low;
    this.high = high;
    this.state = startState;
  }

  reset() {
    this.reps = 0;
    this.framesAtState = 0;
    this.lastTransitionAngle = null;
  }

  /** Returns { reps, stage, transitioned } */
  update(angle: number): { reps: number; stage: Stage; transitioned: boolean } {
    let transitioned = false;

    if (this.state === 'UP') {
      // Looking for descent into DOWN territory
      if (angle < this.low) {
        this.framesAtState += 1;
        if (this.framesAtState >= CONFIRM_FRAMES) {
          this.state = 'DOWN';
          this.framesAtState = 0;
          this.lastTransitionAngle = angle;
        }
      } else {
        this.framesAtState = 0;
      }
    } else {
      // state === 'DOWN' — looking for return to UP territory => completes a rep
      if (angle > this.high) {
        this.framesAtState += 1;
        if (this.framesAtState >= CONFIRM_FRAMES) {
          this.state = 'UP';
          this.framesAtState = 0;
          this.reps += 1;
          this.lastTransitionAngle = angle;
          transitioned = true;
        }
      } else {
        this.framesAtState = 0;
      }
    }

    return { reps: this.reps, stage: this.state, transitioned };
  }

  get currentStage(): Stage {
    return this.state;
  }
}
