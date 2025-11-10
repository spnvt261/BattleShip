// src/utils/sound.ts
export const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => { }); // tránh lỗi nếu chưa có interaction
};

// utils/playSound.ts
const hitAudio = new Audio("/sound/hit.mp3");
const missAudio = new Audio("/sound/ship_place.mp3");
const vibrateAudio = new Audio("/sound/vibrate.mp3")

export const playHitSound = () => hitAudio.play().catch(() => {});
export const playMissSound = () => missAudio.play().catch(() => {});
export const vibrate= () => vibrateAudio.play().catch(() => {});
