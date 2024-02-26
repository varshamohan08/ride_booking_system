import { Injectable } from '@angular/core';
import { GeolocationService } from './geolocation.service';


interface UserDetails {
  username: string;
  user_type: string;
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private locationService: GeolocationService,
  ) { }

  isLoggedIn(): boolean {
    // Check if the user is logged in based on the presence of an access token
    return !!localStorage.getItem('access_token');
  }

  logout(): void {
    // Remove user-related information on logout
    localStorage.removeItem('username');
    localStorage.removeItem('user_type');
    localStorage.removeItem('access_token');
    let watchID = localStorage.getItem('watchID');
    if (watchID) {
      navigator.geolocation.clearWatch(Number(watchID));
      localStorage.removeItem('watchID');
    }
    window.location.reload()
    this.locationService.clearLocation()
  }

  setUserData(userdetails:UserDetails, access_token: string) {
    localStorage.setItem('username', userdetails['username'])
    localStorage.setItem('user_type', userdetails['user_type'])
    localStorage.setItem('access_token', access_token)
    // window.location.reload()
  }


}
