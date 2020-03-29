import { trigger, state, transition, animate, style } from '@angular/animations';

export const returnAnimation = [
//   trigger('keywords', [
//     state('close', style({ opacity: 0 })),
//     state('open', style({ opacity: 1 })),
//     transition('open <=> close', animate('3.0s ease-in-out'))
//   ])
trigger('tone', [
    state('start', style({ opacity: 0.2, backgroundColor: 'green' })),
    state('moved', style({ })),
    transition('moved => start', animate('2.0s ease-in-out'))
  ])
];
