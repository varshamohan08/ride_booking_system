import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  // private watchId: number;
  // private locationSubject = new Subject<Position>();

  // constructor() {}

  // watchLocation(): Observable<Position> {
  //   if ('geolocation' in navigator) {
  //     this.watchId = navigator.geolocation.watchPosition(
  //       (position: Position) => {
  //         this.locationSubject.next(position);
  //       },
  //       (error: PositionError) => {
  //         console.error('Error getting location', error);
  //       }
  //     );
  //   } else {
  //     console.error('Geolocation not supported');
  //   }

  //   return this.locationSubject.asObservable();
  // }

  // clearWatch() {
  //   if (this.watchId) {
  //     navigator.geolocation.clearWatch(this.watchId);
  //   }
  // }
}
