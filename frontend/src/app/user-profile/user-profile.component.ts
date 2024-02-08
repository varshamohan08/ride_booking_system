import { Component, TemplateRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import swal from 'sweetalert';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

interface UserDetails {
  available: boolean,
  email: '',
  id:number,
  location: string, //"{'latitude': 9.585872496805377, 'longitude': 76.63142218802217}"
  mobile:number,
  first_name:string,
  last_name:string,
  vehicle_type:{}
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {

  userType = localStorage.getItem('user_type')
  userName = localStorage.getItem('username')
  userDict: UserDetails;
  watchId:any;
  latitude:any;
  longitude:any;
  API_KEY = 'AIzaSyBhCq3inYOR8fXDLtCAqhq_7B-Epze1oyY'
  html_map = ''
  safeHtmlMap:any
  first_name:any = null
  last_name:any = null
  email:any = null
  mobile:any = null
  current_password = null
  password = null
  confirmPassword = null
  USER_TYPE_CHOICES = [
    {value: 'Customer'},
    {value: 'Driver'},
  ];

  modalRef: any;
  error_message = ""
  confirmPasswordHint = "Passwords matches"
  confirmpasswordBln = false

  mapUrl: SafeResourceUrl | undefined;
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) {
    this.userDict = {} as UserDetails;
    modalRef: NgbModalRef;
  }

  ngOnInit() {
    this.userData()
    // this.locationSubscription = this.geolocationService.watchLocation().subscribe(
    //   (position: Position) => {
    //     const { latitude, longitude } = position.coords;
    //     console.log('Current Location:', latitude, longitude);

    //     // You can update the backend with the new location here
    //   }
    // );
  }

  // getSanitizedURL() {
  //   return this.sanitizer.bypassSecurityTrustUrl(yourUrl);
  // }

  userData() {
    this.backendService.getData('profile_api').subscribe((res)=> {
      console.log(res['user']['available']);
      
      this.userDict= res['user']
      if(res['user']['available']) {
        console.log('in');
        
        this.watchId = navigator.geolocation.watchPosition(
          position => {
            // this.html_map = '<div style="overflow:hidden;resize:none;max-width:100%;width:500px;height:500px;"><div id="gmap-canvas" style="height:100%; width:100%;max-width:100%;"><iframe style="height:100%;width:100%;border:0;" frameborder="0" src="https://www.google.com/maps/embed/v1/directions?origin='+position.coords.latitude+','+position.coords.longitude+'&destination=Kalamassery,+'+position.coords.latitude+','+position.coords.longitude+'&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"></iframe></div><a class="google-map-code-enabler" href="https://www.bootstrapskins.com/themes" id="grab-map-authorization">premium bootstrap themes</a><style>#gmap-canvas img{max-width:none!important;background:none!important;font-size: inherit;font-weight:inherit;}</style></div>'

            console.log(position.coords);

            this.safeHtmlMap = this.sanitizer.bypassSecurityTrustHtml('<div class="mapouter" style="width:100%"><div class="gmap_canvas" style="width:100%"><iframe style="width:100%" height="500" id="gmap_canvas" src="https://maps.google.com/maps?q='+position.coords.latitude+','+position.coords.longitude+'&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://123movies-to.org"></a><br><style>.mapouter{position:relative;text-align:right;height:500px;width:600px;}</style><a href="https://www.embedgooglemap.net"></a><style>.gmap_canvas {overflow:hidden;background:none!important;height:500px;width:600px;}</style></div></div>');
            console.log(this.safeHtmlMap);

            
          }
        );
      }
    }
    ,(error)=> {
      console.error(error);
    }
    )
  }
  editProfile() {

  }
  changePassword() {
    
  }

  userLogout() {
    this.backendService.getData('logout').subscribe((res)=> {
      this.authService.logout()
      this.router.navigate(['login']);   
    }
    ,(error)=> {
      console.error(error);
    }
    )
  }
  UpdateAvailability() {
    let warningtext = ''
    let titletext = ''
    let successtext = ''
    if(this.userDict['available']){
      titletext = 'Shop sharing location?'
      warningtext = 'Once you stop sharing your location, your availability status will be updated to "not available", and you will not be able to receive or accept ride requests.'
      successtext = "Location sharing has been successfully disabled."
    }
    if(!this.userDict['available']){
      titletext = 'Share location?'
      warningtext = 'Once you start sharing the location, your availability status will be updated to "available", and you will be able to receive ride requests.'
      successtext = "Location sharing has been successfully enabled."
    }
    swal({
      title: titletext,
      text: warningtext,
      icon: "warning",
      buttons: ["Cancel", "OK"],
      dangerMode: true,
    })
    .then((value) => {
      console.log(value, 'value');
      
      if (value) {

        this.backendService.patchData('user_api', {}).subscribe((res)=> {
          if (res['detail'] === 'Success') {
            swal(successtext, {
              icon: "success",
            }).then(() => {
              window.location.reload();
            });
          }
          else {
            swal("Something went wrong, please try again.", {
              icon: "error",
            });
          }
        });
        
      } 
    });
  }

	openVerticallyCentered(content: TemplateRef<any>) {
    this.first_name = this.userDict['first_name']
    this.last_name = this.userDict['last_name']
    this.email = this.userDict['email']
    this.mobile = this.userDict['mobile']
    // this.checkUsername()
		this.modalRef = this.modalService.open(content, { size: 'lg', centered: true, windowClass: 'modal' });
	}

	closeModal() {
		if (this.modalRef) {
      this.modalRef.close();
    }
	}
  
  checkUsername() {
    if(this.userName && this.userName!='' && this.userName!=undefined) {
      this.backendService.putData('sign_up', {'username': this.userName}).subscribe((res) => {
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

  editUser() {
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
    // else if((this.password || this.password != undefined || this.password != '') && this.password != this.confirmPassword){
    //     this.confirmPasswordHint = "Passwords does not match"
    //     this.confirmpasswordBln = true
    //     this.toastr.error('Error', 'Passwords does not match')
    // }
    else if (this.error_message !== '') {
      this.toastr.error('Error', 'Username already in use!!!')
    }
    else {
      let dctData = {
        'username' : this.userName,
        'first_name' : this.first_name,
        'last_name' : this.last_name,
        'email' : this.email,
        'mobile' : this.mobile,
        // 'password' : this.password,
        'user_type' : this.userType
      }
      this.backendService.putData('profile_api', dctData).subscribe((res) => {
        if (res['detail'] != 'Success') {
          // this.error_message = res['detail']
          this.toastr.error(res['detail'])
        }
        else {
          this.authService.setUserData(res['userdetails'], res['access_token']);
          this.closeModal()
          swal("Suuccessfully updated", {
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
        }
      })
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

  updatePassword() {
    if((this.password || this.password != undefined || this.password != '') && this.password != this.confirmPassword){
        this.confirmPasswordHint = "Passwords does not match"
        this.confirmpasswordBln = true
        this.toastr.error('Error', 'Passwords does not match')
    }
    else {
      let dctData = {
        'current_password' : this.current_password,
        'new_password' : this.password,
      }
      this.backendService.putData('user_api', dctData).subscribe((res) => {
        if (res['detail'] != 'Success') {
          // this.error_message = res['detail']
          this.toastr.error(res['detail'])
        }
        else {
          // this.authService.setUserData(res['userdetails'], res['access_token']);
          this.closeModal()
          swal("Suuccessfully updated", {
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
        }
      })
    }
  }

  deleteUser() {

    swal({
      title: "Are you sure?",
      text: "Your account would be deleted permanantly",
      icon: "warning",
      buttons: ["Cancel", "OK"],
      dangerMode: true,
    })
    .then((value) => {
      console.log(value, 'value');
      
      if (value) {

        this.backendService.deleteData('profile_api').subscribe((res)=> {
          if (res['detail'] === 'Success') {
            swal("Successfully Deleted", {
              icon: "success",
            }).then(() => {
              this.authService.logout()
              this.router.navigate(['login']); 
            });
          }
          else {
            swal("Something went wrong, please try again.", {
              icon: "error",
            });
          }
        });
        
      } 
    });
  }
}
