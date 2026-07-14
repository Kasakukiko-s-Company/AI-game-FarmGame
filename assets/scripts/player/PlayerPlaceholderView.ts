import { _decorator, Color, Component, Graphics, UITransform } from 'cc';
import { PlayerController } from './PlayerController';
import type { FacingDirection } from './PlayerMovement';

const { ccclass, property, requireComponent } = _decorator;

const BODY_COLOR = new Color(64, 139, 117, 255);
const OUTLINE_COLOR = new Color(21, 55, 48, 255);
const FACING_COLOR = new Color(241, 199, 92, 255);

/** Draws an original geometric placeholder and a small four-direction facing marker. */
@ccclass('PlayerPlaceholderView')
@requireComponent(Graphics)
export class PlayerPlaceholderView extends Component {
  @property({ min: 8, step: 1 })
  public width = 18;

  @property({ min: 8, step: 1 })
  public height = 24;

  private controller: PlayerController | null = null;
  private drawnFacing: FacingDirection | null = null;

  protected override onLoad(): void {
    this.controller = this.getComponent(PlayerController);
    this.getComponent(UITransform)?.setContentSize(this.width, this.height);
    this.redrawIfNeeded();
  }

  protected override update(): void {
    this.redrawIfNeeded();
  }

  private redrawIfNeeded(): void {
    const facing = this.controller?.facing ?? 'down';
    if (this.drawnFacing === facing) {
      return;
    }

    const graphics = this.getComponent(Graphics);
    if (graphics === null) {
      return;
    }

    this.drawnFacing = facing;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    graphics.clear();
    graphics.fillColor = BODY_COLOR;
    graphics.roundRect(-halfWidth, -halfHeight, this.width, this.height, 3);
    graphics.fill();

    graphics.strokeColor = OUTLINE_COLOR;
    graphics.lineWidth = 1;
    graphics.roundRect(-halfWidth, -halfHeight, this.width, this.height, 3);
    graphics.stroke();

    const marker = this.getMarkerPosition(facing, halfWidth, halfHeight);
    graphics.fillColor = FACING_COLOR;
    graphics.circle(marker.x, marker.y, 2.5);
    graphics.fill();
  }

  private getMarkerPosition(
    facing: FacingDirection,
    halfWidth: number,
    halfHeight: number,
  ): { readonly x: number; readonly y: number } {
    switch (facing) {
      case 'up':
        return { x: 0, y: halfHeight - 3 };
      case 'down':
        return { x: 0, y: -halfHeight + 3 };
      case 'left':
        return { x: -halfWidth + 3, y: 0 };
      case 'right':
        return { x: halfWidth - 3, y: 0 };
    }
  }
}
