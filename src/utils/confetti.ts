import confetti from 'canvas-confetti';

let activeConfettiTimer: number | null = null;

export function triggerGoldenConfetti(customZIndex = 25) {
  // Clear any previous confetti loop to avoid particle congestion/lag
  if (activeConfettiTimer) {
    clearInterval(activeConfettiTimer);
    activeConfettiTimer = null;
  }

  // Ultra-luxurious champagne, soft gold, platinum & celestial sparkles
  const colors = ['#ffe082', '#ffd54f', '#ffca28', '#ffecb3', '#fff8e1', '#ffffff', '#f59e0b'];

  let count = 0;
  const maxIterations = 20; // 20 pulses spaced by 120ms = ~2.4s lightweight smooth cascade

  activeConfettiTimer = window.setInterval(() => {
    count++;
    if (count > maxIterations) {
      if (activeConfettiTimer) {
        clearInterval(activeConfettiTimer);
        activeConfettiTimer = null;
      }
      return;
    }

    confetti({
      particleCount: 2,
      angle: 55,
      spread: 45,
      origin: { x: 0.05, y: 0.55 },
      colors: colors,
      shapes: ['circle', 'star'],
      scalar: 0.9,
      gravity: 0.65,
      drift: 0.1,
      ticks: 200,
      zIndex: customZIndex,
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 2,
      angle: 125,
      spread: 45,
      origin: { x: 0.95, y: 0.55 },
      colors: colors,
      shapes: ['circle', 'star'],
      scalar: 0.9,
      gravity: 0.65,
      drift: -0.1,
      ticks: 200,
      zIndex: customZIndex,
      disableForReducedMotion: true,
    });
  }, 120);
}

export function triggerWinnerTrophyBlast(customZIndex = 25) {
  const count = 90; // Optimized particle count for 60fps buttery smooth performance
  const defaults = {
    origin: { y: 0.6 },
    colors: ['#ffe082', '#f59e0b', '#fffbeb', '#ffffff', '#fbbf24', '#d97706'],
    zIndex: customZIndex,
    gravity: 0.7,
    disableForReducedMotion: true,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.3, {
    spread: 35,
    startVelocity: 35,
    ticks: 200,
    scalar: 0.9,
  });
  fire(0.3, {
    spread: 60,
    startVelocity: 30,
    ticks: 220,
    scalar: 1.0,
  });
  fire(0.25, {
    spread: 90,
    decay: 0.93,
    scalar: 0.8,
    ticks: 240,
  });
  fire(0.15, {
    spread: 110,
    startVelocity: 20,
    decay: 0.94,
    scalar: 1.1,
    ticks: 250,
  });
}

