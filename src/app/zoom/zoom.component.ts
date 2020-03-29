import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { of, fromEvent, animationFrameScheduler, Subject, interval, Observable } from 'rxjs';
import { map, switchMap, takeUntil, startWith, tap, filter, subscribeOn, timeout } from 'rxjs/operators';
import { SvgLayer } from '../interfaces/svg';

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
  circleStyle: any;
  transform = 'transform';
  draggingNode = false;
  draggingGrid = false;
  // circleStyle = {
  //   transform: 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)',
  // };

  constructor() { }

  ngOnInit(): void {
    this.initCircle();
  }

  ngAfterViewInit(): void {
    const mousedownGrid = fromEvent(this.svgGrid.nativeElement, 'mousedown');
    const mousemoveGrid = fromEvent(this.svgGrid.nativeElement, 'mousemove');
    const mouseupGrid = fromEvent(document, 'mouseup');
    const mousedownCircle = fromEvent(this.svgCircle.nativeElement, 'mousedown');
    const mousemoveCircle = fromEvent(this.svgCircle.nativeElement, 'mousemove');
    const mouseupCircle = fromEvent(document, 'mouseup');

    const mousewheelGrid = fromEvent(this.svgGrid.nativeElement, 'wheel');

    const scaleFactor = 1.01;

    // WheelEvent
    mousewheelGrid.subscribe((me: WheelEvent) => {
      me.preventDefault();
      const position = this.getEventPosition(me);
      const scale = Math.pow(scaleFactor, me.deltaY < 0 ? 1 : -1);
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
          console.log('offsetX', event.offsetX);
          console.log('offsetY', event.offsetY);
          console.log('clientX', event.clientX);
          console.log('clientY', event.clientY);
          if (event.offsetX) {
            this.svgLayer.positionX = event.offsetX;
            this.svgLayer.positionY = event.offsetY;
          } else {
            const { left, top } = (event.srcElement as Element).getBoundingClientRect();
            this.svgLayer.positionX = event.clientX - left;
            this.svgLayer.positionY = event.clientY - top;
          }

          // this.svgLayer.positionX = event.clientX;
          // this.svgLayer.positionY = event.clientY;

          console.log(event.offsetX);
          this.circleStyle[this.transform] = 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)';
        }
      }
    );
  }

  initCircle() {
    this.svgLayer = {
      id: 2,
      width: 100,
      height: 100,
      positionX: 250,
      positionY: 250,
      rotate: 100,
    };

    this.circleStyle = {
      transform: 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)',
    };
  }

  updateViewBoxMin(dx: number, dy: number, svg: ElementRef<SVGSVGElement>): void {
    const viewBoxList = svg.nativeElement.getAttribute('viewBox').split(' ');
    viewBoxList[0] = '' + (parseInt(viewBoxList[0], 10) - dx);
    viewBoxList[1] = '' + (parseInt(viewBoxList[1], 10) - dy);
    const viewBox = viewBoxList.join(' ');
    svg.nativeElement.setAttribute('viewBox', viewBox);
  }

  //
  getDragAndDropPointOuter(mouseDown: Observable<Event>, mouseMove: Observable<Event>, mouseUp: Observable<Event>): Observable<Point> {
    return mouseDown.pipe(
      switchMap((md: MouseEvent) => {
        md.preventDefault();
        let prevX = md.clientX;
        let prevY = md.clientY;

        return mouseMove.pipe(
          map((mm: MouseEvent) => {
            mm.preventDefault();

            const delta: Point = {
              x: mm.clientX - prevX,
              y: mm.clientY - prevY
            };
            prevX = mm.clientX;
            prevY = mm.clientY;

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
  getEventPosition(we: WheelEvent): Point {
    const point: Point = {x: 0, y: 0};
    if (we.offsetX) {
      point.x = we.offsetX;
      point.y = we.offsetY;
    } else {
      const { left, top } = (we.srcElement as Element ).getBoundingClientRect();
      point.x = we.clientX - left;
      point.y = we.clientY - top;
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

    // const scaledWidth = width * scale;
    // const scaledHeight = height * scale;
    // const scaledMinX = x + scale * (minX - x);
    // const scaledMinY = y + scale * (minY - y);
    const scaledWidth = (width * scale) <= 750 ? (width * scale) : 750;
    const scaledHeight = (height * scale) <= 750 ? (height * scale) : 750;
    const scaledMinX = (x + scale * (minX - x)) >= -100 ? (x + scale * (minX - x)) : -100;
    const scaledMinY = (y + scale * (minY - y)) >= -100 ? (y + scale * (minY - y)) : -100;

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

}
