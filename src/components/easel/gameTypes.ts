// Shared imperative handle every easel game exposes for thumbnailing + saving.
export interface GameHandle {
  // draw the current art onto the given canvas (sizing it to the art's native size)
  renderToCanvas: (canvas: HTMLCanvasElement) => Promise<void>
  // game-specific state for re-editing later
  getState: () => unknown
}
