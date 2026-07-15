import {
  _decorator,
  Component,
  EventKeyboard,
  input,
  Input,
  KeyCode,
  view,
} from 'cc';
import { PlayerController } from '../player/PlayerController';
import type { IInputService, InputSnapshot } from './PlatformContracts';
import { NEUTRAL_INPUT } from './PlatformContracts';

const { ccclass, requireComponent } = _decorator;

/** Converts Cocos keyboard events into the shared semantic input contract. */
@ccclass('KeyboardInputBridge')
@requireComponent(PlayerController)
export class KeyboardInputBridge extends Component implements IInputService {
  private readonly heldKeys = new Set<KeyCode>();
  private controller: PlayerController | null = null;

  protected override onEnable(): void {
    this.controller = this.getComponent(PlayerController);
    this.controller?.setInputService(this);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    view.on('canvas-resize', this.resetHeldKeys, this);
  }

  protected override onDisable(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    view.off('canvas-resize', this.resetHeldKeys, this);
    this.resetHeldKeys();
    this.controller?.clearInputService(this);
    this.controller = null;
  }

  public getSnapshot(): InputSnapshot {
    const left = this.isHeld(KeyCode.KEY_A) || this.isHeld(KeyCode.ARROW_LEFT);
    const right = this.isHeld(KeyCode.KEY_D) || this.isHeld(KeyCode.ARROW_RIGHT);
    const up = this.isHeld(KeyCode.KEY_W) || this.isHeld(KeyCode.ARROW_UP);
    const down = this.isHeld(KeyCode.KEY_S) || this.isHeld(KeyCode.ARROW_DOWN);

    return {
      ...NEUTRAL_INPUT,
      moveX: Number(right) - Number(left),
      moveY: Number(up) - Number(down),
      primaryAction: this.isHeld(KeyCode.SPACE),
      secondaryAction: this.isHeld(KeyCode.KEY_E),
    };
  }

  private readonly onKeyDown = (event: EventKeyboard): void => {
    if (this.isSupportedKey(event.keyCode)) {
      this.heldKeys.add(event.keyCode);
    }
  };

  private readonly onKeyUp = (event: EventKeyboard): void => {
    this.heldKeys.delete(event.keyCode);
  };

  /** Prevents a lost key-up event from leaving movement stuck after a preview resize. */
  private readonly resetHeldKeys = (): void => {
    this.heldKeys.clear();
  };

  private isHeld(keyCode: KeyCode): boolean {
    return this.heldKeys.has(keyCode);
  }

  private isSupportedKey(keyCode: KeyCode): boolean {
    return keyCode === KeyCode.KEY_A ||
      keyCode === KeyCode.KEY_D ||
      keyCode === KeyCode.KEY_W ||
      keyCode === KeyCode.KEY_S ||
      keyCode === KeyCode.ARROW_LEFT ||
      keyCode === KeyCode.ARROW_RIGHT ||
      keyCode === KeyCode.ARROW_UP ||
      keyCode === KeyCode.ARROW_DOWN ||
      keyCode === KeyCode.SPACE ||
      keyCode === KeyCode.KEY_E;
  }
}
