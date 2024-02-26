import { Component, TemplateRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import swal from 'sweetalert';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GeolocationService } from '../geolocation.service';
import { Subscription } from 'rxjs';
// import google from '@angular/google-maps';

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

  zoom = 18;
  center!: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 8,
  };
  markers:any = []
  // zoom = 4;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  locationSubscription:any;
  prevLatitude:any;
  prevLongitude:any;


  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private locationService: GeolocationService
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
        // if(!localStorage.getItem('watchID')) {
          this.locationService.watchLocation()
        // }
        this.watchLocation();
        this.locationSubscription = setInterval(() => {
          this.watchLocation(); 
        }, 10000);
      }
      else{
        this.clearWatch()
      }
    }
    ,(error)=> {
      console.error(error);
    }
    )
  }
  ngOnDestroy() {
    if (this.locationSubscription) {
      clearInterval(this.locationSubscription);
    }
  }
  watchLocation() {   
    if (Number(localStorage.getItem('latitude')) != this.prevLatitude || Number(localStorage.getItem('longitude')) != this.prevLongitude) {
        this.center = {
          lat: Number(localStorage.getItem('latitude')),
          lng: Number(localStorage.getItem('longitude')),
        };
        this.markers= [new google.maps.LatLng(
            Number(localStorage.getItem('latitude')),
            Number(localStorage.getItem('longitude'))
          )]
        console.log(this.markers,'marker');
        this.prevLatitude = Number(localStorage.getItem('latitude'))
        this.prevLongitude = Number(localStorage.getItem('longitude'))
        // localStorage.setItem('watchID', this.watchId)
      }
    // );
  }

  clearWatch() {
    navigator.geolocation.clearWatch(this.watchId)
    localStorage.removeItem('watchID');
  }
 
  addMarker(event: google.maps.MapMouseEvent) {
    if(event.latLng){
      console.log(event.latLng);
      
      this.markerPositions.push(event.latLng.toJSON());
    }
    
  }

  zoomIn() {
    if (this.options.maxZoom && this.zoom < this.options.maxZoom) this.zoom++;
  }
 
  zoomOut() {
    if (this.options.minZoom && this.zoom > this.options.minZoom) this.zoom--;
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
