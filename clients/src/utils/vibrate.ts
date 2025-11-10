// src/utils/vibrate.ts
export const vibrate = (pattern: number | number[]) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};
