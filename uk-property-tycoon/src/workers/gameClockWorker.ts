// Game Clock Web Worker
let intervalId: number | null = null;
let speed = 1;
let isRunning = false;

self.onmessage = function(e) {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      if (!isRunning) {
        startClock();
        isRunning = true;
      }
      break;
    
    case 'STOP':
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        isRunning = false;
      }
      break;
    
    case 'SET_SPEED':
      speed = payload.speed;
      if (isRunning) {
        // Restart with new speed
        if (intervalId !== null) {
          clearInterval(intervalId);
        }
        startClock();
      }
      break;
  }
};

function startClock() {
  // In game, 1 month = 180 seconds real time
  // So 1 second real time = 1/180 months game time
  // Update every 1000ms (1 second) at 1x speed
  const gameSecondsPerRealSecond = 180 / 60; // 3 game seconds per real second at 1x speed
  
  intervalId = self.setInterval(() => {
    const gameSecondsToAdd = gameSecondsPerRealSecond * speed;
    self.postMessage({
      type: 'TICK',
      payload: {
        seconds: gameSecondsToAdd
      }
    });
  }, 1000);
}

export const initializeGameWorker = () => {
  const worker = new Worker(new URL('./gameClockWorker.ts', import.meta.url), {
    type: 'module'
  });
  return worker;
};
