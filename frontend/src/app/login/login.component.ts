import { Component } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { BackendService } from '../backend.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  matcher = new MyErrorStateMatcher();
  showSignInRide = false
  showSignInDrive = false
  hide = true;
  userName = null
  password = null
  error_message:string = '';

  constructor(
    private backendService: BackendService,
    private authService: AuthService, 
    private router: Router,
    ) {}

  ngOnInit() {
    if(localStorage.getItem('user_type') === "Admin") {
      this.router.navigate(['user-list']);
    }
    if(localStorage.getItem('user_type') === "Driver") {
      this.router.navigate(['profile']);
    }
    if(localStorage.getItem('user_type') === "Customer") {
      this.router.navigate(['profile']);
    }

    if(localStorage.getItem('showSignInRide') === 'true') {
      this.showSignInRide = true
    }
    if(localStorage.getItem('showSignInDrive') === 'true') {
      this.showSignInDrive = true
    }
  }

  showSignInBox(action:string) {
    if(action ==='ride') {
      this.showSignInRide = true
      localStorage.setItem('showSignInRide','true')
      localStorage.removeItem('showSignInDrive')
    }
    if(action === 'drive') {
      this.showSignInDrive = true
      localStorage.setItem('showSignInDrive','true')
      localStorage.removeItem('showSignInRide')
    }
  }

  closeSignInBox() {
    localStorage.removeItem('showSignInRide')
    localStorage.removeItem('showSignInDrive')
    this.showSignInDrive = false
    this.showSignInRide = false
  }

  userLogin() {
    let dctData = {
      'username': this.userName,
      'password': this.password
    }
    this.backendService.postDataBeforeLogin('login', dctData).subscribe((res)=> {
      if (res['detail'] != 'Success') {
        this.error_message = res['detail']
      }
      else {
        this.authService.setUserData(res['userdetails'], res['access_token']);
        window.location.reload()

      }
    }
    ,(error)=> {
      console.error(error);
      this.error_message = 'An error occurred';
    }
    )
  }
}
