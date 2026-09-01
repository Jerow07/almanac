import confetti from 'canvas-confetti';

/**
 * Fires lovely pastel confetti to celebrate completing a task together!
 */
export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#EC4899', '#F472B6', '#3B82F6', '#60A5FA', '#A78BFA', '#FDE047'],
      disableForReducedMotion: true,
    });
  } catch {
    // Fallback if canvas is not supported
  }
};
