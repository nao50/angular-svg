type Pixel = number;
type Radian = number;

export interface SvgLayer {
  id: number;
  width: Pixel;
  height: Pixel;
  positionX: Pixel;
  positionY: Pixel;
  rotate: Radian;
  color: string;
  rx: number;
  ry: number;
  isSelected: boolean;
  shadowFilter: string;
  // jointNode: JointNode[];
}

export interface JointNode {
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
}
