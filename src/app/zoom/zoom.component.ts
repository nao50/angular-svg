import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { of, fromEvent, animationFrameScheduler, Subject, interval, Observable } from 'rxjs';
import { map, switchMap, takeUntil, startWith, tap, filter, subscribeOn, timeout } from 'rxjs/operators';
import { SvgLayer } from '../interfaces/svg';
import { v4 as uuidv4 } from 'uuid';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent implements OnInit, AfterViewInit {
  @ViewChild('svgGrid', { read: ElementRef }) svgGrid: ElementRef<SVGSVGElement>;
  @ViewChild('svgCircle', { read: ElementRef }) svgCircle: ElementRef<SVGSVGElement>;

  svgLayer: SvgLayer;
  svgLayers: SvgLayer[] = [];

  circleStyle: any;
  transform = 'transform';
  draggingNode = false;
  draggingGrid = false;

  constructor() { }

  ngOnInit(): void {
    this.initCircle();
  }

  ngAfterViewInit(): void {
    const mousedownGrid = fromEvent(this.svgGrid.nativeElement, 'mousedown');
    const mousemoveGrid = fromEvent(this.svgGrid.nativeElement, 'mousemove');
    const mouseupGrid = fromEvent(document, 'mouseup');
    const mousedownCircle = fromEvent(this.svgCircle.nativeElement, 'mousedown');
    // const mousemoveCircle = fromEvent(this.svgCircle.nativeElement, 'mousemove');
    const mousemoveCircle = fromEvent(document, 'mousemove');
    const mouseupCircle = fromEvent(document, 'mouseup');

    const mousewheelGrid = fromEvent(this.svgGrid.nativeElement, 'wheel');

    const scaleFactor = 1.01;

    // WheelEvent
    mousewheelGrid.subscribe((wheel: WheelEvent) => {
      wheel.preventDefault();
      const position = this.getEventPosition(wheel);
      const scale = Math.pow(scaleFactor, wheel.deltaY < 0 ? 1 : -1);
      this.zoomAtPoint(position, this.svgGrid.nativeElement, scale);
    });

    // Grid DragAndDrop Event
    this.getDragAndDropPointOuter(mousedownGrid, mousemoveGrid, mouseupGrid).subscribe(
      (point: Point) => {
        if (!this.draggingNode){
          console.log('OUTEEEERRRR!!!!!!!!!');
          this.updateViewBoxMin(point.x, point.y, this.svgGrid);
        }
      }
    );

    // Node DragAndDrop Event
    this.getDragAndDropInner(mousedownCircle, mousemoveCircle, mouseupCircle).pipe(
      subscribeOn(animationFrameScheduler)
    ).subscribe(
      (event: MouseEvent) => {
        if (!this.draggingGrid){
          event.stopPropagation();
          ////////////////////////////////////////////////////////////////////////////////
          const viewBoxList = this.svgGrid.nativeElement.getAttribute('viewBox').split(' ');

          // console.log('offsetX', event.offsetX);
          // console.log('offsetY', event.offsetY);
          // console.log('clientX', event.clientX);
          // console.log('clientY', event.clientY);
          // const aaa = parseInt(viewBoxList[2], 10);
          // const bbb = parseInt(viewBoxList[3], 10);
          // const ccc = (501 - parseInt(viewBoxList[2], 10));
          // const ddd = (501 - parseInt(viewBoxList[3], 10));
          const aspX = (parseInt(viewBoxList[2], 10) / 501);
          const aspY = (parseInt(viewBoxList[3], 10) / 501);

          if (event.offsetX) {
            this.svgLayer.positionX = ((event.offsetX * aspX) + parseInt(viewBoxList[0], 10)) ;
            this.svgLayer.positionY = ((event.offsetY * aspY) + parseInt(viewBoxList[1], 10)) ;
            // this.svgLayer.positionX = (event.offsetX + parseInt(viewBoxList[0], 10)) * eee;
            // this.svgLayer.positionY = (event.offsetY + parseInt(viewBoxList[1], 10)) * fff;
          } else {
            const { left, top } = (event.srcElement as Element).getBoundingClientRect();
            this.svgLayer.positionX = event.clientX - left + parseInt(viewBoxList[0], 10);
            this.svgLayer.positionY = event.clientY - top + parseInt(viewBoxList[1], 10);
          }

          // console.log(event.offsetX);
          this.circleStyle[this.transform] = 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)';
        }
      }
    );
  }

  initCircle() {
    this.svgLayer = {
      id: '2',
      width: 100,
      height: 100,
      positionX: 250,
      positionY: 250,
      rotate: 100,
      color: 'red',
      rx: 10,
      ry: 10,
      isSelected: false,
      shadowFilter: 'url(#shadow)',
    };

    this.circleStyle = {
      transform: 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)',
    };
  }

  updateViewBoxMin(dx: number, dy: number, svg: ElementRef<SVGSVGElement>): void {
    // this.svgLayer.positionX = this.svgLayer.positionX - dx;
    // this.svgLayer.positionY = this.svgLayer.positionY - dy;

    const viewBoxList = svg.nativeElement.getAttribute('viewBox').split(' ');
    viewBoxList[0] = '' + (parseInt(viewBoxList[0], 10) - dx);
    viewBoxList[1] = '' + (parseInt(viewBoxList[1], 10) - dy);

    const viewBox = viewBoxList.join(' ');
    svg.nativeElement.setAttribute('viewBox', viewBox);
  }

  //
  getDragAndDropPointOuter(mouseDown: Observable<Event>, mouseMove: Observable<Event>, mouseUp: Observable<Event>): Observable<Point> {
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

  //
  getDragAndDropInner(mouseDown: Observable<Event>, mouseMove: Observable<Event>, mouseUp: Observable<Event>): Observable<Point> {
    return mouseDown.pipe(
      switchMap((start: MouseEvent) => {
        console.log('node drag start');
        this.draggingNode = true;
        return mouseMove.pipe(
          map((move: MouseEvent) => {
            console.log('node drag moving');
            move.preventDefault();
            move.stopPropagation();
            mouseUp.subscribe(() => {
              console.log('node drag finish');
              this.draggingNode = false;
            });
            return move;
          }),
          takeUntil(mouseUp)
        );
      })
    );
  }

  //
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

  //
  zoomAtPoint(point: Point, svg: SVGSVGElement, scale: number): void {
    const sx = point.x / svg.clientWidth;
    const sy = point.y / svg.clientHeight;

    const [minX, minY, width, height] = svg.getAttribute('viewBox')
      .split(' ')
      .map(s => parseFloat(s));

    const x = minX + width * sx;
    const y = minY + height * sy;

    // const scaledMinX = x + scale * (minX - x);
    // const scaledMinY = y + scale * (minY - y);
    // const scaledWidth = width * scale;
    // const scaledHeight = height * scale;

    const scaledMinX = (x + scale * (minX - x)) >= -100 ? (x + scale * (minX - x)) : -100;
    const scaledMinY = (y + scale * (minY - y)) >= -100 ? (y + scale * (minY - y)) : -100;
    const scaledWidth = (width * scale) <= 750 ? (width * scale) : 750;
    const scaledHeight = (height * scale) <= 750 ? (height * scale) : 750;


    const scaledViewBox = [scaledMinX, scaledMinY, scaledWidth, scaledHeight]
      .map(s => s.toFixed(2))
      .join(' ');

    svg.setAttribute('viewBox', scaledViewBox);
  }


  move(){
    this.svgLayer.positionX += 10;
    this.svgLayer.positionY += 10;
    this.circleStyle = {
      transform: 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)',
    };
    console.log(this.svgLayer);
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
      rx: 10,
      ry: 10,
      isSelected: false,
      shadowFilter: 'url(#shadow)',
    };
    this.svgLayers.push(newSvgLayer);
  }

}
