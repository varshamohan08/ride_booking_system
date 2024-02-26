import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  watchId:any;
  id:any;
  latitude:any;
  longitude:any;
  prevPosition:any;
  prevLatitude:any;
  prevLongitude:any;
  location: any


  constructor(
    private http: HttpClient,
  ) {
  }

  getLocation() {
    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          console.log(position);
          
          localStorage.setItem('latitude', position.coords.latitude.toString());
          localStorage.setItem('longitude', position.coords.longitude.toString());
          resolve(); // Resolve the promise once location is retrieved
        },
        (error: any) => {
          console.error('Error getting location:', error);
          reject(error); // Reject the promise if there's an error
        }
      );
    });
  }

  watchLocation() {
    this.location = setInterval(()=>{
      this.watchId = navigator.geolocation.getCurrentPosition((position)=> {
        console.log(position.coords, this.prevPosition, position.coords !== this.prevPosition);
        
        if (position.coords.latitude != this.prevLatitude || position.coords.longitude != this.prevLongitude) {
          this.saveLocation(position)
          this.prevPosition = position.coords
          this.prevLatitude = position.coords.latitude
          this.prevLongitude = position.coords.longitude
        }
        
      })
    },10000)
  }
  clearLocation() {
    clearInterval(this.location)
  }
  
  saveLocation (position:any) {
    let data = {
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }
    console.log(position,'pos');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });
    
    this.http.put('http://localhost:8000/update_location', { position: data }, {headers}).subscribe(
      (res:any) => {
        if (res['detail'] !== 'Success') {
          console.log(res['detail']);
        }
        else{

          localStorage.setItem('watchID', this.watchId)
          localStorage.setItem('latitude', position.coords.latitude.toString())
          localStorage.setItem('longitude', position.coords.longitude.toString())
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
 
}
