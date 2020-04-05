type Pixel = number;
type Radian = number;

export interface SvgLayer {
  id: string;
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
}

export interface SVGLayer {
  id: string;
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
  connectionNodes?: ConnectionNode[];
}

// connector に rename
export interface ConnectionNode {
  id: string;
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  // entrustedPoint: string; // startPoint | endPoint
  connectedPoint: '' | 'startPoint' | 'endPoint';
  connections?: Connection[];
}

export interface Connection {
  id: string;
  // entrustedPoint: string; // startPoint | endPoint
  // entrustedPoint: 'startPoint' | 'endPoint';
  connectedOutPointID?: string;
  connectedInPointID?: string;
  startPointX?: number;
  startPointY?: number;
  controlPointX?: number;
  controlPointY?: number;
  centerPointX?: number;
  centerPointY?: number;
  endPointX?: number;
  endPointY?: number;
  color?: string;
}


