import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { SvgLayer } from '../interfaces/svg';

@Directive({
  selector: '[appDrdr]'
})
export class DrdrDirective {
  @Input() public svgLayer: SvgLayer;
  @Output() svgLayerChange = new EventEmitter<SvgLayer>();

  constructor(
    private elementRef: ElementRef
  ) { }

  @HostListener('mouseenter', ['$event.target']) changeBackgroundColor(target: any) {
    // console.log(target);
    this.elementRef.nativeElement.style.backgroundColor = 'rgb(255, 0, 0)';
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    // this.svgLayer.positionX = event.clientX;
    // this.svgLayer.positionY = event.clientY;
    // this.svgLayerChange.emit(this.svgLayer)
  }

  @HostListener('mouseleave', ['$event.target']) restoreBackgroundColor(target: any) {
    // console.log(target);
    this.elementRef.nativeElement.style.backgroundColor = 'rgb(219, 210, 224)';
  }


  // svg.addEventListener('mousedown', startDrag);
  // svg.addEventListener('mousemove', drag);
  // svg.addEventListener('mouseup', endDrag);
  // svg.addEventListener('mouseleave', endDrag);

}
