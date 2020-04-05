import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { SVGLayer, ConnectionNode, Connection } from '../interfaces/svg';
import { v4 as uuidv4 } from 'uuid';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-grid2',
  templateUrl: './grid2.component.html',
  styleUrls: ['./grid2.component.scss']
})
export class Grid2Component implements OnInit, AfterViewInit {
  @ViewChild('svgGrid', { read: ElementRef }) svgGrid: ElementRef<SVGSVGElement>;

  svgLayers: SVGLayer[] = [];
  svgLayer: SVGLayer;
  isDraggingSVGLayer = false;
  draggingSVGLayer: SVGLayer;
  selectedSVGLayer: SVGLayer;
  selectedSVGLayers: SVGLayer[] = [];
  isDraggingGrid = false;
  gridStartClientX: number;
  gridStartClientY: number;
  scaleFactor = 1.02;

  // svgLayerPaths https://stackoverflow.com/questions/50877255/how-to-set-attribute-d-pf-path-element-in-angular-2
  Connections: Connection[] = [];
  draggingConnection: Connection;
  isDraggingConnection = false;

  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandleGrid(event: PointerEvent) {
    this.isDraggingGrid = false;
  }
  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SVGLayer){
    this.isDraggingGrid = false;
    this.isDraggingSVGLayer = false;
    this.isDraggingConnection = false;
    this.draggingSVGLayer = null;
  }

  @HostListener( 'document:pointermove', [ '$event' ] )
  public moveHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SVGLayer){
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    if (!this.isDraggingGrid && !this.isDraggingConnection && this.isDraggingSVGLayer){
      console.log(this.isDraggingConnection);
      const viewBoxList = this.svgGrid.nativeElement.getAttribute('viewBox').split(' ');
      const aspX = (parseInt(viewBoxList[2], 10) / 501);
      const aspY = (parseInt(viewBoxList[3], 10) / 501);
      // move SVGLayer
      if (pointerEvent.offsetX) {
        this.draggingSVGLayer.positionX = this.round((pointerEvent.offsetX * aspX) + parseInt(viewBoxList[0], 10)) ;
        this.draggingSVGLayer.positionY = this.round((pointerEvent.offsetY * aspY) + parseInt(viewBoxList[1], 10)) ;
      } else {
        const { left, top } = (pointerEvent.srcElement as Element).getBoundingClientRect();
        this.draggingSVGLayer.positionX = pointerEvent.clientX - left + parseInt(viewBoxList[0], 10);
        this.draggingSVGLayer.positionY = pointerEvent.clientY - top + parseInt(viewBoxList[1], 10);
      }
      // move connector
      this.draggingSVGLayer.connectionNodes[0].cx = this.draggingSVGLayer.positionX - 50;
      this.draggingSVGLayer.connectionNodes[0].cy = this.draggingSVGLayer.positionY;
      this.draggingSVGLayer.connectionNodes[1].cx = this.draggingSVGLayer.positionX + 50;
      this.draggingSVGLayer.connectionNodes[1].cy = this.draggingSVGLayer.positionY;
      // move connection
      if (this.draggingSVGLayer.connectionNodes[0].connections?.length > 0) {
        this.draggingSVGLayer.connectionNodes[0].connections.forEach((connection: Connection) => {
          connection.endPointX = this.draggingSVGLayer.connectionNodes[0].cx;
          connection.endPointY = this.draggingSVGLayer.connectionNodes[0].cy;
        });
      }
      if (this.draggingSVGLayer.connectionNodes[1].connections?.length > 0) {
        this.draggingSVGLayer.connectionNodes[1].connections.forEach((connection: Connection) => {
          connection.startPointX = this.draggingSVGLayer.connectionNodes[1].cx;
          connection.startPointY = this.draggingSVGLayer.connectionNodes[1].cy;
        });
      }
    }
    if (!this.isDraggingGrid && this.isDraggingConnection && !this.isDraggingSVGLayer){
      console.log('AAAAAAAAAAAA');
    }
  }

  @HostListener('document:keyup', ['$event'])
  public handleKeyboardEvent(keyboardEvent: KeyboardEvent) {
    keyboardEvent.preventDefault();
    if (keyboardEvent.keyCode === 8 || keyboardEvent.keyCode === 46) {
      if (this.selectedSVGLayers.length > 0){
        this.svgLayers = this.svgLayers.filter(svgLayer => !svgLayer.isSelected);
      }
    }
  }

  // @HostListener( 'document:pointermove', [ '$event' ] )
  // public moveHandleConnection(pointerEvent: PointerEvent, svgLayer: SVGLayer, connectionNode: ConnectionNode){
  //   pointerEvent.preventDefault();
  //   pointerEvent.stopPropagation();
  //   console.log('FLSVLSKNVLSKDNVLKVN')
  //   if (!this.isDraggingGrid && this.isDraggingConnection && !this.isDraggingSVGLayer){}
  // }

  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandleConnection(pointerEvent: PointerEvent, svgLayer: SVGLayer, connectionNode: ConnectionNode){
    this.isDraggingGrid = false;
    this.isDraggingSVGLayer = false;
    this.isDraggingConnection = false;
    this.draggingSVGLayer = null;
  }



  //////////////////////////////////////////////////////////////////////////////
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {}


  //////////////////////////////////////////////////////////////////////////////
  // Handle Grid
  downHandleGrid(pointerEvent: PointerEvent){
    if (!this.isDraggingSVGLayer){
      this.isDraggingGrid = true;
      pointerEvent.preventDefault();
      this.gridStartClientX = 0;
      this.gridStartClientY = 0;
      this.gridStartClientX = pointerEvent.clientX;
      this.gridStartClientY = pointerEvent.clientY;
    }
  }

  // upHandleGrid(){}

  moveHandleGrid(pointerEvent: PointerEvent){
    if (this.isDraggingGrid && !this.isDraggingSVGLayer) {
      pointerEvent.preventDefault();
      const delta: Point = {
        x: pointerEvent.clientX - this.gridStartClientX,
        y: pointerEvent.clientY - this.gridStartClientY
      };
      this.gridStartClientX = pointerEvent.clientX;
      this.gridStartClientY = pointerEvent.clientY;

      this.updateViewBoxMin(delta.x, delta.y);
    }
  }
  // moveHandleGrid
  updateViewBoxMin(dx: number, dy: number): void {
    const viewBoxList = this.svgGrid.nativeElement.getAttribute('viewBox').split(' ');
    viewBoxList[0] = '' + (parseInt(viewBoxList[0], 10) - dx);
    viewBoxList[1] = '' + (parseInt(viewBoxList[1], 10) - dy);
    const viewBox = viewBoxList.join(' ');
    this.svgGrid.nativeElement.setAttribute('viewBox', viewBox);
  }

  wheelHandleGrid(wheelEvent: WheelEvent){
    wheelEvent.preventDefault();
    const position = this.getEventPosition(wheelEvent);
    const scale = Math.pow(this.scaleFactor, wheelEvent.deltaY < 0 ? 1 : -1);
    this.zoomAtPoint(position, this.svgGrid.nativeElement, scale);
  }
  // wheelHandleGrid
  getEventPosition(wheel: WheelEvent): Point {
    const point: Point = {x: 0, y: 0};
    if (wheel.offsetX) {
      point.x = wheel.offsetX;
      point.y = wheel.offsetY;
    } else {
      const { left, top } = (wheel.srcElement as Element ).getBoundingClientRect();
      point.x = wheel.clientX - left;
      point.y = wheel.clientY - top;
    }
    return point;
  }
  // wheelHandleGrid
  zoomAtPoint(point: Point, svg: SVGSVGElement, scale: number): void {
    const sx = point.x / svg.clientWidth;
    const sy = point.y / svg.clientHeight;
    const [minX, minY, width, height] = svg.getAttribute('viewBox')
      .split(' ')
      .map(s => parseFloat(s));
    const x = minX + width * sx;
    const y = minY + height * sy;
    const scaledMinX = this.cutoffScaledMin(x + scale * (minX - x));
    const scaledMinY = this.cutoffScaledMin(y + scale * (minY - y));
    const scaledWidth = this.cutoffScaledLength(width * scale);
    const scaledHeight = this.cutoffScaledLength(height * scale);
    const scaledViewBox = [scaledMinX, scaledMinY, scaledWidth, scaledHeight]
      .map(s => s.toFixed(2))
      .join(' ');
    svg.setAttribute('viewBox', scaledViewBox);
  }
  // zoomAtPoint
  cutoffScaledMin(scaledMin: number): number{
    return scaledMin >= -100 ? scaledMin : -100;
  }
  cutoffScaledLength(length: number): number{
    return length <= 750 ? length : 750;
  }

  clickHandleGrid(pointerEvent: PointerEvent){
    pointerEvent.preventDefault();
    if (this.selectedSVGLayers.length > 0){
      this.selectedSVGLayers.forEach((selectedSVGLayer: SVGLayer) => {
        selectedSVGLayer.isSelected = false;
        selectedSVGLayer.shadowFilter = 'url(#shadow)';
      });
      this.selectedSVGLayers = [];
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Handle SVGLayer
  downHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SVGLayer){
    this.isDraggingGrid = false;
    this.isDraggingSVGLayer = true;
    this.draggingSVGLayer = svgLayer;
    pointerEvent.preventDefault();
  }

  // upHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SVGLayer){}

  // moveHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SVGLayer){}

  clickHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SVGLayer){
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    if (!pointerEvent.shiftKey) {
      if (this.selectedSVGLayers.length > 0){
        this.selectedSVGLayers.forEach((selectedSVGLayer: SVGLayer) => {
          selectedSVGLayer.isSelected = false;
          selectedSVGLayer.shadowFilter = 'url(#shadow)';
        });
        this.selectedSVGLayers = [];
      }
    }

    svgLayer.isSelected = true;
    svgLayer.shadowFilter = 'url(#liftedShadow)';
    this.selectedSVGLayers.push(svgLayer);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Handle Connection
  downHandleConnection(pointerEvent: PointerEvent, svgLayer: SVGLayer, connectionNode: ConnectionNode){
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    this.isDraggingConnection = true;

    const spX = +(pointerEvent.srcElement as Element ).getAttribute('cx');
    const spY = +(pointerEvent.srcElement as Element ).getAttribute('cy');

    const connection: Connection = {
      id: uuidv4(),
      connectedOutPointID: connectionNode.id,
      // connectedInPointID: '',
      startPointX: spX,
      startPointY: spY,
      // controlPointX: 100,
      // controlPointY: 300,
      // centerPointX: 200,
      // centerPointY: 0,
      // endPointX: 400,
      // endPointY: 0,
      // color: 'red',
    };
    connectionNode.connectedPoint = 'startPoint';
    this.draggingConnection = connection;
    // connectionNode.connections.push(connection);

  }

  // upHandleConnection(pointerEvent: PointerEvent, svgLayer: SVGLayer, connectionNode: ConnectionNode){}

  moveHandleConnection(pointerEvent: PointerEvent, svgLayer: SVGLayer, connectionNode: ConnectionNode){}



  //////////////////////////////////////////////////////////////////////////////
  // button
  move(){
  }

  addSvgLayers(){
    const randomMin = 100 ;
    const randomMax = 400 ;
    // const randomColor = [ 'blue', 'black', 'red', 'green', 'none' ];
    const randomColor = ['white'];

    const w = 100;
    const h = 100;
    const pX = this.round(Math.floor( Math.random() * (randomMax + 1 - randomMin) ) + randomMin);
    const pY = this.round(Math.floor( Math.random() * (randomMax + 1 - randomMin) ) + randomMin);

    const newSvgLayer: SVGLayer = {
      id: uuidv4(),
      width: w,
      height: h,
      positionX: pX,
      positionY: pY,
      rotate: 0,
      color: randomColor[ Math.floor( Math.random() * randomColor.length ) ],
      rx: 10,
      ry: 10,
      isSelected: false,
      shadowFilter: 'url(#shadow)',
      //
      connectionNodes: [
        {
          id: uuidv4(),
          cx: pX - (w / 2),
          cy: pY,
          r: 10,
          stroke: 'black',
          strokeWidth: 1,
          fill: 'white',
          connectedPoint: '',
          connections: [],
        },
        {
          id: uuidv4(),
          cx: pX + (w / 2),
          cy: pY,
          r: 10,
          stroke: 'black',
          strokeWidth: 1,
          fill: 'white',
          connectedPoint: '',
          connections: [],
        },
      ],
    };
    this.svgLayers.push(newSvgLayer);
  }

  round(v) {
    return Math.round(v / 10) * 10;
  }
}
