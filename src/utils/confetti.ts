import confetti from 'canvas-confetti';

export function triggerGoldenConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  // Gold, Silver, Bronze & Champagne metallic sparkles
  const colors = ['#ffd700', '#fbbf24', '#fef08a', '#e2e8f0', '#cbd5e1', '#d4af37', '#ffffff'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      shapes: ['star', 'circle'],
      scalar: 1.2
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      shapes: ['star', 'circle'],
      scalar: 1.2
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export function triggerWinnerTrophyBlast() {
  const count = 200;
  const defaults = {
    origin: { y: 0.6 },
    colors: ['#ffd700', '#f59e0b', '#f8fafc', '#ffffff', '#b45309']
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
