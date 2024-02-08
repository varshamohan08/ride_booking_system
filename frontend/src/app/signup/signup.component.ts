import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  showSignInRide = false
  showSignInDrive = false
  first_name = null
  last_name = null
  email = null
  mobile = null
  userType = ''
  username= null
  password = null
  confirmPassword = null
  USER_TYPE_CHOICES = [
    {value: 'Customer'},
    {value: 'Driver'},
  ];

  error_message = "Username already exists"
  confirmPasswordHint = "Passwords matches"
  confirmpasswordBln = false
  constructor(
    private backendService: BackendService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.LoadFilters()
  }
  
  LoadFilters() {
    this.backendService.getDataBeforeLogin('sign_up').subscribe((res) => {
    });
  }
  
  checkUsername() {
    if(this.username && this.username!='' && this.username!=undefined) {
      this.backendService.putDataBeforeLogin('sign_up', {'username': this.username}).subscribe((res) => {
        if(res['detail'] != "Success") {
          console.log(res);
          
          this.error_message = res['detail']
        }
        else {
          this.error_message = ''
        }
      });
    }
    
  }
  
  confirmPasswordFn() {
    if(this.password || this.password != undefined || this.password != ''){
      if(this.password === this.confirmPassword) {
        this.confirmpasswordBln = true
        this.confirmPasswordHint = "Passwords matches"
      }
      else {
        this.confirmPasswordHint = "Passwords does not match"
        this.confirmpasswordBln = true
      }
    }
  }

  showSignInBox(action:string) {
    if(action ==='ride') {
      console.log('in');
      this.userType = 'Customer'
      this.showSignInRide = true
    }
    if(action === 'drive') {
      this.userType = 'Driver'
      this.showSignInDrive = true
      this.LoadFilters()
    }
  }

  closeSignInBox() {
    
    this.userType = ''
    this.showSignInRide = false
    this.showSignInDrive = false
  }

  userSignUp() {
    let dctData = {}
    if (!this.first_name || this.first_name === undefined || this.first_name === '') {
      this.toastr.error('Error', 'First name is required')
    }
    else if (!this.last_name || this.last_name === undefined || this.last_name === '') {
      this.toastr.error('Error', 'First name is required')
    }
    else if (!this.email || this.email === undefined || this.email === '') {
      this.toastr.error('Error', 'First name is required')
    }
    else if (!this.mobile || this.mobile === undefined || this.mobile === '') {
      this.toastr.error('Error', 'First name is required')
    }
    else if((this.password || this.password != undefined || this.password != '') && this.password != this.confirmPassword){
        this.confirmPasswordHint = "Passwords does not match"
        this.confirmpasswordBln = true
        this.toastr.error('Error', 'Passwords does not match')
    }
    else if (this.error_message !== '') {
      this.toastr.error('Error', 'Username already in use!!!')
    }
    else {
      let dctData = {
        'username' : this.username,
        'first_name' : this.first_name,
        'last_name' : this.last_name,
        'email' : this.email,
        'mobile' : this.mobile,
        'password' : this.password,
        'user_type' : this.userType
      }
      this.backendService.postDataBeforeLogin('sign_up', dctData).subscribe((res) => {
        if (res['detail'] != 'Success') {
          // this.error_message = res['detail']
          this.toastr.error(res['detail'])
        }
        else {
          this.authService.setUserData(res['userdetails'], res['access_token']);
          
          if(res['userdetails']['user_type'] = "Admin") {
            this.router.navigate(['profile']);
          }
  
        }

      })
    }
  }
}
