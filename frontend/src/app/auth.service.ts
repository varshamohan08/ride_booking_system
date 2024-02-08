import { Injectable } from '@angular/core';


interface UserDetails {
  username: string;
  user_type: string;
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isLoggedIn(): boolean {
    // Check if the user is logged in based on the presence of an access token
    return !!localStorage.getItem('access_token');
  }

  logout(): void {
    // Remove user-related information on logout
    localStorage.removeItem('username');
    localStorage.removeItem('user_type');
    localStorage.removeItem('access_token');
    window.location.reload()
  }

  setUserData(userdetails:UserDetails, access_token: string) {
    localStorage.setItem('username', userdetails['username'])
    localStorage.setItem('user_type', userdetails['user_type'])
    localStorage.setItem('access_token', access_token)
    // window.location.reload()
  }


}
