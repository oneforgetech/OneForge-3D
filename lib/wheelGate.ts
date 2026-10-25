// Decides when a wheel/trackpad event starts a NEW scroll gesture, as opposed to being the
// momentum tail of the one we already acted on. One gesture = one step.
//
// A real trackpad swipe is a ramp up, a peak, then a long, UNEVEN tail (often 1–2 s of events that
// wobble up and down). So the rules are deliberately strict:
//  - a pause longer than 120 ms, or a change of direction, starts a new gesture;
//  - otherwise only an unmistakable second flick does: a big jump (>= 2.4x the recent average and
//    at least 25 px) after the events had clearly been fading, and not within 450 ms of the last
//    step. The wobbles in a tail never reach that.
// (lib/wheelGate.ts is mirrored by the small inline pager in app/layout.tsx for the plain page.)

export type WheelGate = (timeStamp: number, dy: number) => boolean;

export function createWheelGate(): WheelGate {
  let lastTs = -1e9;
  let lastDir = 0;
  let lastFresh = -1e9;
  let avg = 0; // running average of recent strength
  let fading = 0;
  let prev = 0;
  let consumed = false;

  return (ts, dy) => {
    const abs = Math.abs(dy);
    const dir = Math.sign(dy);
    let fresh = false;
    if (ts - lastTs > 120 || dir !== lastDir) {
      fresh = true;
    } else {
      if (abs < prev) fading++;
      else if (abs > prev * 1.1) fading = Math.max(0, fading - 1);
      if (fading >= 4 && abs >= 25 && abs > avg * 2.4 && ts - lastFresh > 450) fresh = true;
    }
    avg = fresh ? abs : avg * 0.75 + abs * 0.25;
    if (fresh) {
      fading = 0;
      consumed = false;
      lastFresh = ts;
    }
    lastTs = ts;
    lastDir = dir;
    prev = abs;
    if (fresh && !consumed) {
      consumed = true;
      return true;
    }
    return false;
  };
}
