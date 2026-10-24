export type GameInput = { left: boolean; right: boolean; jump: boolean; jumpPressed: boolean; run: boolean; fist: boolean; pausePressed: boolean; debugPressed: boolean; restartPressed: boolean };

export class Input {
  state: GameInput = { left: false, right: false, jump: false, jumpPressed: false, run: false, fist: false, pausePressed: false, debugPressed: false, restartPressed: false };
  private keys = new Set<string>();
  private onDown = (event: KeyboardEvent) => {
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(event.code)) event.preventDefault();
    if (!this.keys.has(event.code) && ['Space','KeyW','ArrowUp'].includes(event.code)) this.state.jumpPressed = true;
    if (!this.keys.has(event.code) && ['KeyP','Escape'].includes(event.code)) this.state.pausePressed = true;
    if (!this.keys.has(event.code) && event.code === 'KeyR') this.state.restartPressed = true;
    if (!this.keys.has(event.code) && event.code === 'F3') { event.preventDefault(); this.state.debugPressed = true; }
    this.keys.add(event.code); this.sync();
  };
  private onUp = (event: KeyboardEvent) => { this.keys.delete(event.code); this.sync(); };
  attach() { window.addEventListener('keydown', this.onDown); window.addEventListener('keyup', this.onUp); }
  detach() { window.removeEventListener('keydown', this.onDown); window.removeEventListener('keyup', this.onUp); }
  endFrame() { this.state.jumpPressed = false; this.state.pausePressed = false; this.state.debugPressed = false; this.state.restartPressed = false; }
  private sync() {
    this.state.left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    this.state.right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    this.state.jump = this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('ArrowUp');
    this.state.run = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    this.state.fist = this.keys.has('KeyJ') || this.keys.has('KeyX');
  }
}
