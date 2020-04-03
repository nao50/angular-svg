import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { of, fromEvent, animationFrameScheduler, Subject, interval, Observable } from 'rxjs';
import { map, switchMap, takeUntil, startWith, tap, filter, subscribeOn, timeout } from 'rxjs/operators';
import { SvgLayer } from '../interfaces/svg';
import { v4 as uuidv4 } from 'uuid';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, AfterViewInit {
  @ViewChild('svgGrid', { read: ElementRef }) svgGrid: ElementRef<SVGSVGElement>;
  @ViewChildren('svgLayerGroup', { read: ElementRef }) children: QueryList<ElementRef>;

  svgLayers: SvgLayer[] = [];
  idDraggingSVGLayer = false;
  idDraggingGrid = false;

  scaleFactor = 1.01;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    // Grid Events
    const mousedownGrid = fromEvent(this.svgGrid.nativeElement, 'pointerdown');
    const mousemoveGrid = fromEvent(this.svgGrid.nativeElement, 'pointermove');
    const mouseupGrid = fromEvent(document, 'pointerup');
    const mousewheelGrid = fromEvent(this.svgGrid.nativeElement, 'wheel');

    ///////////////////////
    // WheelEvent in Grid
    mousewheelGrid.subscribe((wheel: WheelEvent) => {
      wheel.preventDefault();
      const position = this.getEventPosition(wheel);
      const scale = Math.pow(this.scaleFactor, wheel.deltaY < 0 ? 1 : -1);
      this.zoomAtPoint(position, this.svgGrid.nativeElement, scale);
    });

    ///////////////////////
    // DragAndDrop in Grid
    this.getDragAndDropPointInGrid(mousedownGrid, mousemoveGrid, mouseupGrid).subscribe(
      (point: Point) => {
        if (!this.idDraggingSVGLayer){
          this.updateViewBoxMin(point.x, point.y, this.svgGrid);
        }
      }
    );


  }


  //////////////////////////////////////////////////////////////////////
  // grid 
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

  // grid
  zoomAtPoint(point: Point, svg: SVGSVGElement, scale: number): void {
    const sx = point.x / svg.clientWidth;
    const sy = point.y / svg.clientHeight;
    const [minX, minY, width, height] = svg.getAttribute('viewBox')
      .split(' ')
      .map(s => parseFloat(s));
    const x = minX + width * sx;
    const y = minY + height * sy;
    const scaledMinX = (x + scale * (minX - x)) >= -100 ? (x + scale * (minX - x)) : -100;
    const scaledMinY = (y + scale * (minY - y)) >= -100 ? (y + scale * (minY - y)) : -100;
    const scaledWidth = (width * scale) <= 750 ? (width * scale) : 750;
    const scaledHeight = (height * scale) <= 750 ? (height * scale) : 750;
    const scaledViewBox = [scaledMinX, scaledMinY, scaledWidth, scaledHeight]
      .map(s => s.toFixed(2))
      .join(' ');
    svg.setAttribute('viewBox', scaledViewBox);
  }

  // grid 
  getDragAndDropPointInGrid(mouseDown: Observable<Event>, mouseMove: Observable<Event>, mouseUp: Observable<Event>): Observable<Point> {
    return mouseDown.pipe(
      switchMap((start: MouseEvent) => {
        start.preventDefault();
        let prevX = start.clientX;
        let prevY = start.clientY;
        return mouseMove.pipe(
          map((move: MouseEvent) => {
            move.preventDefault();
            const delta: Point = {
              x: move.clientX - prevX,
              y: move.clientY - prevY
            };
            prevX = move.clientX;
            prevY = move.clientY;
            return delta;
          }),
          takeUntil(mouseUp)
        );
      })
    );
  }

  // grid 
  updateViewBoxMin(dx: number, dy: number, svg: ElementRef<SVGSVGElement>): void {
    const viewBoxList = svg.nativeElement.getAttribute('viewBox').split(' ');
    viewBoxList[0] = '' + (parseInt(viewBoxList[0], 10) - dx);
    viewBoxList[1] = '' + (parseInt(viewBoxList[1], 10) - dy);
    const viewBox = viewBoxList.join(' ');
    svg.nativeElement.setAttribute('viewBox', viewBox);
  }

  //////////////////////////////////////////////////////////////////////
  // svg layer


  //////////////////////////////////////////////////////////////////////
  // button
  move(){
  }

  addSvgLayers(){
    const randomMin = 100 ;
    const randomMax = 400 ;
    const randomColor = [ 'blue', 'black', 'red', 'green' ] ;

    const newSvgLayer: SvgLayer = {
      id: uuidv4(),
      width: 100,
      height: 100,
      positionX: Math.floor( Math.random() * (randomMax + 1 - randomMin) ) + randomMin,
      positionY: Math.floor( Math.random() * (randomMax + 1 - randomMin) ) + randomMin,
      rotate: 0,
      color: randomColor[ Math.floor( Math.random() * randomColor.length ) ],
    };
    this.svgLayers.push(newSvgLayer);

    //////
    // console.log('this.children', this.children);

    // this.children.changes.subscribe((r) => {
    //   console.log(r);
    // });

    this.children.forEach(child => {
      console.log('child.nativeElement', child);
    });

    // this.children.map(child => {
    //   console.log('child.nativeElement', child.nativeElement.childNodes);
    // });

  }


}
