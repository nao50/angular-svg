import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { SvgLayer } from '../interfaces/svg';
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

  svgLayers: SvgLayer[] = [];
  svgLayer: SvgLayer;
  isDraggingSVGLayer = false;
  draggingSVGLayer: SvgLayer;
  selectedSVGLayer: SvgLayer;
  selectedSVGLayers: SvgLayer[] = [];
  isDraggingGrid = false;
  gridStartClientX: number;
  gridStartClientY: number;
  scaleFactor = 1.02;
  rectClass = ['rect'];
  shadow = 'url(#shadow)';

  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandleGrid(event: PointerEvent) {
    this.isDraggingGrid = false;
  }
  @HostListener( 'document:pointerup', [ '$event' ] )
  public upHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SvgLayer){
    this.isDraggingSVGLayer = false;
    this.draggingSVGLayer = null;
  }

  @HostListener( 'document:pointermove', [ '$event' ] )
  public moveHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SvgLayer){
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    if (!this.isDraggingGrid && this.isDraggingSVGLayer){
      const viewBoxList = this.svgGrid.nativeElement.getAttribute('viewBox').split(' ');
      const aspX = (parseInt(viewBoxList[2], 10) / 501);
      const aspY = (parseInt(viewBoxList[3], 10) / 501);
      if (pointerEvent.offsetX) {
        this.draggingSVGLayer.positionX = this.round((pointerEvent.offsetX * aspX) + parseInt(viewBoxList[0], 10)) ;
        this.draggingSVGLayer.positionY = this.round((pointerEvent.offsetY * aspY) + parseInt(viewBoxList[1], 10)) ;
      } else {
        const { left, top } = (pointerEvent.srcElement as Element).getBoundingClientRect();
        this.draggingSVGLayer.positionX = pointerEvent.clientX - left + parseInt(viewBoxList[0], 10);
        this.draggingSVGLayer.positionY = pointerEvent.clientY - top + parseInt(viewBoxList[1], 10);
      }
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
      this.selectedSVGLayers.forEach((selectedSVGLayer: SvgLayer) => {
        selectedSVGLayer.isSelected = false;
        selectedSVGLayer.shadowFilter = 'url(#shadow)';
      });
      this.selectedSVGLayers = [];
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Handle SVGLayer
  downHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SvgLayer){
    this.isDraggingGrid = false;
    this.isDraggingSVGLayer = true;
    this.draggingSVGLayer = svgLayer;
    pointerEvent.preventDefault();
  }

  // upHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SvgLayer){}

  // moveHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SvgLayer){}

  clickHandleSVGLayer(pointerEvent: PointerEvent, svgLayer: SvgLayer){
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    if (!pointerEvent.shiftKey) {
      if (this.selectedSVGLayers.length > 0){
        this.selectedSVGLayers.forEach((selectedSVGLayer: SvgLayer) => {
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
  // button
  move(){
  }

  addSvgLayers(){
    const randomMin = 100 ;
    const randomMax = 400 ;
    // const randomColor = [ 'blue', 'black', 'red', 'green', 'none' ];
    const randomColor = ['white'];

    const newSvgLayer: SvgLayer = {
      id: uuidv4(),
      width: 100,
      height: 100,
      positionX: this.round(Math.floor( Math.random() * (randomMax + 1 - randomMin) ) + randomMin),
      positionY: this.round(Math.floor( Math.random() * (randomMax + 1 - randomMin) ) + randomMin),
      rotate: 0,
      color: randomColor[ Math.floor( Math.random() * randomColor.length ) ],
      rx: 10,
      ry: 10,
      isSelected: false,
      shadowFilter: 'url(#shadow)',
    };
    this.svgLayers.push(newSvgLayer);
  }

  round(v) {
    return Math.round(v / 10) * 10;
  }
}
