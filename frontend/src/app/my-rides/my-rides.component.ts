import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';
import swal from 'sweetalert';

@Component({
  selector: 'app-my-rides',
  templateUrl: './my-rides.component.html',
  styleUrls: ['./my-rides.component.scss']
})
export class MyRidesComponent {
  
  rideList: any[] = [];
  paginatedRides: any[] = [];
  paginator: { currentPage: number, lastPage: number, pages: number[] } = { currentPage: 1, lastPage: 1, pages: [] };
  searchText: string = '';
  userType = localStorage.getItem('user_type')

  constructor(
    private backendService: BackendService,
    private router: Router,
    ) {}

  ngOnInit() {
    this.rideData()
  }

  rideData() {
    this.backendService.getData('ride/ride_api').subscribe((res) => {
      console.log(res);

      this.paginatedRides = res['results']['rides'];
      this.paginator = { currentPage: 1, lastPage: res['results']['last_page'], pages: Array.from({ length: res['results']['last_page'] }, (_, i) => i + 1) };
    }, (error) => {
      console.error(error);
    });
  }

  changePage(page: number) {
    this.backendService.getData(`ride/ride_api?page=${page}`).subscribe((res) => {
      console.log(res);
      this.rideList = res['results']['rides']
      this.paginatedRides = res['results']['rides'];
      this.paginator.currentPage = page;
    }, (error) => {
      console.error(error);
    });
  }

  changeStatus(id: any, status:any) {
    swal({
      title: 'Cancel Ride',
      text: 'Driver yet to acknowledge, do you want to cancel the ride request',
      icon: "warning",
      buttons: ["Cancel", "OK"],
      dangerMode: true,
    })
    .then((value) => {
      console.log(value, 'value');
      
      if (value) {

        this.backendService.putData(`ride/ride_api`, {'id':id, 'status': status}).subscribe((res) => {
          if (res['detail'] === 'Success') {
            swal('Ride canceled', {
              icon: "success",
            }).then(() => {
              this.rideData()
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
