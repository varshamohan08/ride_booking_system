import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    const userId = localStorage.getItem('id');
    const wsUrl = `ws://localhost:8001/ws/rides?user_id=${userId}`;
    this.socket$ = webSocket(wsUrl);
  }

  private createWebSocket(): WebSocketSubject<any> {
    return webSocket('http://localhost:8001/ws/rides');
  }


  connect(userId: number) {
    this.socket$ = webSocket(`http://localhost:8001/ws/rides?user_id=${userId}`);
  }

  getRideNotifications() {
    return this.socket$.asObservable();
  }

  subscribeToRideNotifications() {
    this.socket$.next({ type: 'subscribe' });
  }
}
