import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import swal from 'sweetalert';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  hostAddress = 'http://localhost:8000/';
  token = localStorage.getItem('access_token') || ''

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  updateLocation(){
    
  }

  getDataBeforeLogin(url: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': jwttoken
    });

    return this.http
      .get(this.hostAddress + url, { headers })
      .pipe(
        catchError((error: any) => {
          return throwError('something went wrong in the server');
        })
      );
  }

  postDataBeforeLogin(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': jwttoken
    });

    return this.http
      .post(this.hostAddress + url, data, { headers })
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError((error: any) => {
          return throwError('something went wrong in the server');
        })
      );
  }

  putDataBeforeLogin(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': jwttoken
    });

    return this.http
      .put(this.hostAddress + url, data, { headers })
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError((error: any) => {
          return throwError('something went wrong in the server');
        })
      );
  }

  getData(url: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });

    return this.http.get(this.hostAddress + url, { headers }).pipe(
      catchError((error: any) => {
        console.error(error);
        if (error.status === 401 && error.error && error.error.code === 'token_not_valid') {
          this.authService.logout()
          this.router.navigate(['login']);
        }
        else if (error.status === 403) {

          swal(error.error.detail, {
            icon: "warning",
          });
          this.router.navigate(['']);
          
        }
        return throwError(error);
      })
    );

  }

  patchData(url: string, data:any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });

    return this.http.patch(this.hostAddress + url, data, { headers }).pipe(
      catchError((error: any) => {
        console.error(error);
        if (error.status === 401 && error.error && error.error.code === 'token_not_valid') {
          this.authService.logout()
          this.router.navigate(['login']);
        }
        return error
      })
    );

  }

  putData(url: string, data:any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });

    return this.http.put(this.hostAddress + url, data, { headers }).pipe(
      catchError((error: any) => {
        console.error(error);
        if (error.status === 401 && error.error && error.error.code === 'token_not_valid') {
          this.authService.logout()
          this.router.navigate(['login']);
        }
        return error
      })
    );

  }

  postData(url: string, data:any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });

    return this.http.post(this.hostAddress + url, data, { headers }).pipe(
      catchError((error: any) => {
        console.error(error);
        if (error.status === 401 && error.error && error.error.code === 'token_not_valid') {
          this.authService.logout()
          this.router.navigate(['login']);
        }
        return error
      })
    );

  }

  deleteData(url: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });

    return this.http.delete(this.hostAddress + url, { headers }).pipe(
      catchError((error: any) => {
        console.error(error);
        if (error.status === 401 && error.error && error.error.code === 'token_not_valid') {
          this.authService.logout()
          this.router.navigate(['login']);
        }
        return error
      })
    );

  }
  
}
