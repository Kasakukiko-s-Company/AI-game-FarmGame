import {
  _decorator,
  Color,
  Component,
  Graphics,
  Node,
  UITransform,
  view,
  warn,
} from 'cc';
import {
  createQuickbarProjection,
  resolveQuickbarItem,
  type QuickbarItemUse,
} from '../inventory/Quickbar';
import type { InventoryState } from '../inventory/InventoryState';
import { TiledTillingController } from '../farming/TiledTillingController';

const { ccclass, property, requireComponent } = _decorator;

const PANEL_COLOR = new Color(30, 37, 40, 220);
const SLOT_COLOR = new Color(62, 73, 74, 235);
const EMPTY_SLOT_COLOR = new Color(47, 56, 58, 225);
const SLOT_OUTLINE_COLOR = new Color(119, 138, 132, 255);
const SELECTED_COLOR = new Color(241, 199, 92, 255);
const NUMBER_COLOR = new Color(225, 231, 214, 255);
const HOE_HANDLE_COLOR = new Color(139, 91, 55, 255);
const HOE_BLADE_COLOR = new Color(174, 185, 177, 255);
const WATERING_CAN_COLOR = new Color(91, 151, 164, 255);
const SEED_COLOR = new Color(208, 176, 91, 255);
const CROP_COLOR = new Color(90, 166, 103, 255);
const GENERIC_ITEM_COLOR = new Color(173, 143, 190, 255);

const DIGIT_GLYPHS: Readonly<Record<string, ReadonlyArray<string>>> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};

interface QuickbarViewSetup {
  readonly source: TiledTillingController;
  readonly cameraNode: Node;
  readonly graphics: Graphics;
  readonly transform: UITransform;
}

/** Draws the authoritative eight-slot inventory as a camera-anchored quickbar. */
@ccclass('QuickbarView')
@requireComponent(Graphics)
export class QuickbarView extends Component {
  @property({
    type: TiledTillingController,
    tooltip: 'Player TiledTillingController that owns the authoritative inventory.',
  })
  public source: TiledTillingController | null = null;

  @property({
    type: Node,
    tooltip: 'Camera node whose X/Y position anchors the quickbar to the viewport.',
  })
  public cameraNode: Node | null = null;

  @property({ min: 24, max: 48, step: 1, tooltip: 'Logical size of each square slot.' })
  public slotSize = 32;

  @property({ min: 0, max: 12, step: 1, tooltip: 'Logical gap between adjacent slots.' })
  public slotGap = 3;

  @property({ min: 4, max: 48, step: 1, tooltip: 'Distance from the visible bottom edge.' })
  public bottomMargin = 12;

  private drawnInventory: InventoryState | null = null;
  private didWarnMissingSetup = false;

  protected override onEnable(): void {
    this.drawnInventory = null;
  }

  protected override onDisable(): void {
    this.getComponent(Graphics)?.clear();
    this.drawnInventory = null;
    this.didWarnMissingSetup = false;
  }

  protected override lateUpdate(): void {
    const setup = this.getSetup();
    if (setup === null) {
      this.getComponent(Graphics)?.clear();
      this.warnMissingSetupOnce();
      return;
    }

    this.didWarnMissingSetup = false;
    this.anchorToViewport(setup);
    const inventory = setup.source.inventoryState;
    if (inventory === this.drawnInventory) {
      return;
    }

    this.drawnInventory = inventory;
    this.redraw(setup, inventory);
  }

  private anchorToViewport(setup: QuickbarViewSetup): void {
    const visibleSize = view.getVisibleSize();
    const cameraPosition = setup.cameraNode.worldPosition;
    const currentPosition = this.node.worldPosition;
    this.node.setWorldPosition(
      cameraPosition.x,
      cameraPosition.y - visibleSize.height / 2 + this.bottomMargin + this.slotSize / 2,
      currentPosition.z,
    );
  }

  private redraw(setup: QuickbarViewSetup, inventory: InventoryState): void {
    const slots = createQuickbarProjection(inventory);
    const totalWidth = slots.length * this.slotSize +
      Math.max(0, slots.length - 1) * this.slotGap;
    const left = -totalWidth / 2;
    const bottom = -this.slotSize / 2;
    setup.transform.setContentSize(totalWidth, this.slotSize);
    setup.graphics.clear();

    setup.graphics.fillColor = PANEL_COLOR;
    setup.graphics.rect(left - 4, bottom - 4, totalWidth + 8, this.slotSize + 8);
    setup.graphics.fill();

    for (const slot of slots) {
      const slotLeft = left + slot.slotIndex * (this.slotSize + this.slotGap);
      this.drawSlot(
        setup,
        slotLeft,
        bottom,
        slot.slotIndex,
        slot.stack,
        slot.isSelected,
      );
    }
  }

  private drawSlot(
    setup: QuickbarViewSetup,
    left: number,
    bottom: number,
    slotIndex: number,
    stack: InventoryState['slots'][number],
    isSelected: boolean,
  ): void {
    const graphics = setup.graphics;
    graphics.fillColor = stack === null ? EMPTY_SLOT_COLOR : SLOT_COLOR;
    graphics.rect(left, bottom, this.slotSize, this.slotSize);
    graphics.fill();

    graphics.strokeColor = isSelected ? SELECTED_COLOR : SLOT_OUTLINE_COLOR;
    graphics.lineWidth = isSelected ? 2 : 1;
    graphics.rect(left, bottom, this.slotSize, this.slotSize);
    graphics.stroke();

    this.drawNumber(graphics, slotIndex + 1, left + 3, bottom + this.slotSize - 8, 1);
    const resolved = resolveQuickbarItem(
      stack,
      setup.source.itemDefinitions,
      setup.source.startingHoeItemId,
      setup.source.startingWateringCanItemId,
    );
    this.drawItemIcon(
      graphics,
      resolved.use,
      left + this.slotSize / 2,
      bottom + this.slotSize / 2,
    );
    if (stack !== null && stack.quantity > 1) {
      const digits = String(stack.quantity).length;
      const width = digits * 4 - 1;
      this.drawNumber(
        graphics,
        stack.quantity,
        left + this.slotSize - width - 3,
        bottom + 3,
        1,
      );
    }
  }

  private drawItemIcon(
    graphics: Graphics,
    use: QuickbarItemUse,
    centerX: number,
    centerY: number,
  ): void {
    if (use === 'empty') {
      return;
    }
    if (use === 'till') {
      graphics.strokeColor = HOE_HANDLE_COLOR;
      graphics.lineWidth = 3;
      graphics.moveTo(centerX - 5, centerY - 7);
      graphics.lineTo(centerX + 4, centerY + 7);
      graphics.stroke();
      graphics.fillColor = HOE_BLADE_COLOR;
      graphics.rect(centerX + 1, centerY + 5, 9, 4);
      graphics.fill();
      return;
    }
    if (use === 'water') {
      graphics.fillColor = WATERING_CAN_COLOR;
      graphics.rect(centerX - 7, centerY - 5, 12, 10);
      graphics.rect(centerX + 5, centerY, 6, 3);
      graphics.fill();
      graphics.strokeColor = WATERING_CAN_COLOR;
      graphics.lineWidth = 2;
      graphics.moveTo(centerX - 5, centerY + 5);
      graphics.lineTo(centerX - 5, centerY + 9);
      graphics.lineTo(centerX + 2, centerY + 9);
      graphics.lineTo(centerX + 3, centerY + 5);
      graphics.stroke();
      return;
    }
    if (use === 'plant') {
      graphics.fillColor = SEED_COLOR;
      graphics.circle(centerX - 4, centerY - 2, 3);
      graphics.circle(centerX + 3, centerY + 3, 3);
      graphics.circle(centerX + 4, centerY - 5, 2);
      graphics.fill();
      return;
    }
    if (use === 'carry') {
      graphics.fillColor = CROP_COLOR;
      graphics.rect(centerX - 1, centerY - 7, 2, 14);
      graphics.rect(centerX - 7, centerY, 6, 5);
      graphics.rect(centerX + 1, centerY + 2, 6, 5);
      graphics.fill();
      graphics.fillColor = GENERIC_ITEM_COLOR;
      graphics.rect(centerX - 3, centerY + 7, 6, 4);
      graphics.fill();
    }
  }

  private drawNumber(
    graphics: Graphics,
    value: number,
    left: number,
    bottom: number,
    scale: number,
  ): void {
    graphics.fillColor = NUMBER_COLOR;
    let digitLeft = left;
    for (const digit of String(value)) {
      const glyph = DIGIT_GLYPHS[digit];
      if (glyph === undefined) {
        continue;
      }
      glyph.forEach((row, rowIndex) => {
        for (let column = 0; column < row.length; column += 1) {
          if (row[column] !== '1') {
            continue;
          }
          graphics.rect(
            digitLeft + column * scale,
            bottom + (glyph.length - 1 - rowIndex) * scale,
            scale,
            scale,
          );
        }
      });
      digitLeft += 4 * scale;
    }
    graphics.fill();
  }

  private getSetup(): QuickbarViewSetup | null {
    const source = this.source;
    const cameraNode = this.cameraNode;
    const graphics = this.getComponent(Graphics);
    const transform = this.getComponent(UITransform);
    if (
      source === null || cameraNode === null ||
      graphics === null || transform === null
    ) {
      return null;
    }
    return { source, cameraNode, graphics, transform };
  }

  private warnMissingSetupOnce(): void {
    if (this.didWarnMissingSetup) {
      return;
    }
    this.didWarnMissingSetup = true;
    warn('[QuickbarView] Assign Source and Camera Node on a UI_2D node.');
  }
}
