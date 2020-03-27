import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { SvgLayer } from './interfaces/svg';
import { of, fromEvent, animationFrameScheduler, Subject } from 'rxjs';
import { map, switchMap, takeUntil, startWith, tap, filter, subscribeOn } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  svgLayer: SvgLayer = {
    id: 1,
    width: 100,
    height: 100,
    positionX: 250,
    positionY: 200,
    rotate: 100,
  };

  linePt1: SVGPoint;
  linePt2: SVGPoint;

  @ViewChild('circle1', { read: ElementRef })
  circle1: ElementRef;
  @ViewChild('circle2', { read: ElementRef })
  circle2: ElementRef;
  @ViewChild('svg', { read: ElementRef })
  svg: ElementRef;

  destroy = new Subject<void>();

  // @HostListener( 'document:click', [ '$event' ] )
  // onTest(event: MouseEvent) {
  //   console.log('event: ', event);
  // }

  constructor() {
  }

  ngAfterViewInit() {
    const svgLayerMousedwon = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mousedown');
    const svgLayerMouseenter = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mouseenter');
    const svgLayerMousemove = fromEvent<MouseEvent>(document, 'mousemove');
    const svgLayerMouseleave = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mouseleave');
    // const svgLayerMouseup = fromEvent<MouseEvent>(this.circle2.nativeElement, 'mouseup');
    const svgLayerMouseup = fromEvent<MouseEvent>(document, 'mouseup');

    // svgLayerMousemove.subscribe((event: MouseEvent) => {
    //   this.svgLayer.positionX = event.clientX;
    //   this.svgLayer.positionY = event.clientY;
    // });

    //// 
    // mousedown$.pipe(
    //   switchMapTo(mousemove$.pipe(
    //     tap((event: any) => {
    //        this.style = {left: `${event.clientX}px`, top: `${event.clientY}px`};
    //     }),
    //     takeUntil(mouseup$)
    //   )),
    //   takeUntil(this.destroy$)
    // ).subscribe();


    const drag = svgLayerMousedwon.pipe(
      switchMap((start: MouseEvent) => {
        return svgLayerMousemove.pipe(
            map((move: MouseEvent) => {
              move.preventDefault();
              if (!(0 < move.clientX && move.clientX < 300) || !(0 < move.clientY && move.clientY < 300)){
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
    });



    const svg = this.svg.nativeElement;
    const c1 = this.circle1.nativeElement as SVGCircleElement;
    const c2 = this.circle2.nativeElement as SVGCircleElement;

    const matrix1 = c1.getCTM();
    const matrix2 = c2.getCTM();

    const pt = svg.createSVGPoint();
    this.linePt1 = pt.matrixTransform(matrix1);
    this.linePt2 = pt.matrixTransform(matrix2);
  }

  public ngOnDestroy(){
    this.destroy.next();
  }

  click(event: MouseEvent){
    console.log('linePt1: ', this.linePt1);
    console.log('linePt2: ', this.linePt2);
  }
}
