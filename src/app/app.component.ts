import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { SvgLayer } from './interfaces/svg';
import { of, fromEvent, animationFrameScheduler, Subject, interval } from 'rxjs';
import { map, switchMap, takeUntil, startWith, tap, filter, subscribeOn, timeout } from 'rxjs/operators';
import { returnAnimation } from './animations/return.animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [returnAnimation]
})
export class AppComponent implements AfterViewInit, OnDestroy {
  x = 100;

  stat = 'moved';
  svgLayer: SvgLayer = {
    id: 1,
    width: 100,
    height: 100,
    positionX: 250,
    positionY: 200,
    rotate: 100,
    color: 'red',
  };

  toneStyle = {
    transform: 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)',
  };
  // toneStyle = {
  //   transform: 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)',
  // };

  // linePt1: SVGPoint;
  // linePt2: SVGPoint;

  @ViewChild('circle1', { read: ElementRef })
  circle1: ElementRef;
  @ViewChild('circle2', { read: ElementRef })
  circle2: ElementRef;
  @ViewChild('svg2', { read: ElementRef })
  svg2: ElementRef;

  destroy = new Subject<void>();

  constructor() {
  }

  ngAfterViewInit() {
    const svgLayerMousedwon = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mousedown');
    const svgLayerMouseenter = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mouseenter');
    const svgLayerMousemove = fromEvent<MouseEvent>(document, 'mousemove');
    const svgLayerMouseleave = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mouseleave');
    // const svgLayerMouseup = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mouseup');
    const svgLayerMouseup = fromEvent<MouseEvent>(document, 'mouseup');

    //
    const mousedown$ = fromEvent(this.svg2.nativeElement, 'mousedown');
    const mousemove$ = fromEvent(this.svg2.nativeElement, 'mousemove');
    const mouseup$ = fromEvent(document, 'mouseup');

    //
    const drag = svgLayerMousedwon.pipe(
      switchMap((start: MouseEvent) => {
        return svgLayerMousemove.pipe(
            map((move: MouseEvent) => {
              move.preventDefault();
              if (!(0 < move.clientX && move.clientX < 300) || !(0 < move.clientY && move.clientY < 300)){
                this.toneStyle['transition'] = 'transform 1s';
                return start;
              } else {
                return move;
              }
            }),
          takeUntil(svgLayerMouseup)
        );
      })
    );

    const position = drag.pipe(subscribeOn(animationFrameScheduler));

    position.subscribe(event => {
      this.svgLayer.positionX = event.clientX;
      this.svgLayer.positionY = event.clientY;

      this.toneStyle['transform'] = 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)';
      setTimeout(() => delete this.toneStyle['transition'], 1500);
    });


    ////////////////////////////////////////////////////////////////////
    const mousedrag$ = mousedown$.pipe(
      switchMap((md: MouseEvent) => {
        md.preventDefault();
    
        let prevX = md.clientX;
        let prevY = md.clientY;
        return mousemove$.pipe(
          map((mm: MouseEvent) => {
            mm.preventDefault();
    
            const delta = {
              x: mm.clientX - prevX,
              y: mm.clientY - prevY
            };
            prevX = mm.clientX;
            prevY = mm.clientY;
    
            return delta;
          }),
          takeUntil(mouseup$)
        );
      })
    );

    ////////////////////////////////////////////////////////////////////
    const updateViewBoxMin = (dx, dy) => {
      const viewBoxList = this.svg2.nativeElement.getAttribute('viewBox').split(' ');
      viewBoxList[0] = '' + (parseInt(viewBoxList[0]) - dx);
      viewBoxList[1] = '' + (parseInt(viewBoxList[1]) - dy);
      const viewBox = viewBoxList.join(' ');
      this.svg2.nativeElement.setAttribute('viewBox', viewBox);
      // message.textContent = viewBox;
    };

    ////////////////////////////////////////////////////////////////////
    mousedrag$.subscribe(({x, y}) => updateViewBoxMin(x, y));

    ////////////////////////////////////////////////////////////////////
    const getEventPosition = (ev) => {
      let x, y;
      if (ev.offsetX) {
        x = ev.offsetX;
        y = ev.offsetY;
      } else {
        const { left, top } = ev.srcElement.getBoundingClientRect();
        x = ev.clientX - left;
        y = ev.clientY - top;
      }
      return { x, y };
    };
    ////////////////////////////////////////////////////////////////////
    const scaleFactor = 1.01;

    const zoomAtPoint = (point, svg, scale) => {
      // normalized position from 0 to 1
      const sx = point.x / svg.clientWidth;
      const sy = point.y / svg.clientHeight;

      // get current viewBox
      const [minX, minY, width, height] = svg.getAttribute('viewBox')
        .split(' ')
        .map(s => parseFloat(s));

      const x = minX + width * sx;
      const y = minY + height * sy;

      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const scaledMinX = x + scale * (minX - x);
      const scaledMinY = y + scale * (minY - y);

      const scaledViewBox = [scaledMinX, scaledMinY, scaledWidth, scaledHeight]
        .map(s => s.toFixed(2))
        .join(' ');

      svg.setAttribute('viewBox', scaledViewBox);
      // message.textContent = scaledViewBox;
    };

    this.svg2.nativeElement.addEventListener('wheel', ev => {
      ev.preventDefault();
      const position = getEventPosition(ev);
      console.log(position);
      const scale = Math.pow(scaleFactor, ev.deltaY < 0 ? 1 : -1);
      zoomAtPoint(position, this.svg2.nativeElement, scale);
    });
    ////////////////////////////////////////////////////////////////////

  }

  ngOnDestroy(){
    this.destroy.next();
  }

  setStyles(){
    return this.toneStyle = {
      transform: 'translate(' + this.svgLayer.positionX + 'px,' + this.svgLayer.positionY + 'px)',
      // transition: 'transform 1s'
    };
  }


  // moveTo(start: MouseEvent, move: MouseEvent) {
  //   let interval: MouseEvent;
  //   interval.clientX = start.clientX - move.clientX;

  // }

}
