import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import swal from 'sweetalert';
import { IconOptions, PointExpression } from 'leaflet';
import { BackendService } from '../backend.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-ride',
  templateUrl: './view-ride.component.html',
  styleUrls: ['./view-ride.component.scss']
})
export class ViewRideComponent {

  userType = localStorage.getItem('user_type')
  actionBtnName:any = null;
  actionBtnValue:any = null;

  originCoordinates:any;
  destinCoordinates:any;
  driverCoordinates:any;

  directionsResults:any;

  directions: google.maps.DirectionsResult | undefined;
  map: any;


  originIconOptions: IconOptions = {
    iconUrl: '../../assets/icons/location-pin.png',
    iconSize: [32, 32] as PointExpression,
    iconAnchor: [16, 32] as PointExpression
  };
  
  destinationIconOptions: IconOptions = {
    iconUrl: '../../assets/icons/destination.png',
    iconSize: [32, 32] as PointExpression,
    iconAnchor: [16, 32] as PointExpression
  };
  
  rideIconOptions: IconOptions = {
    iconUrl: '../../assets/icons/car.png',
    iconSize: [32, 32] as PointExpression,
    iconAnchor: [16, 32] as PointExpression
  };

  rideId:any;
  rideDetails:any;

  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private toastr: ToastrService,
  private backendService: BackendService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.rideId = params['id'];
      console.log(this.rideId);
    });
  }

  ngOnInit() {
    this.rideData()
  }

  rideData() {
    this.backendService.getData('ride/ride_api?id='+this.rideId).subscribe((res) => {
      console.log(res);
      new Promise<void>((resolve) => {
        this.rideDetails = res['ride'];
        if(this.userType == 'Driver' && res['ride']['status']['status'] == 'Accepted'){
          this.actionBtnName = 'Start Ride'
          this.actionBtnValue = 'Start'
        }
        else if(this.userType == 'Driver' && res['ride']['status']['status'] == 'Started'){
          this.actionBtnName = 'Complete Ride'
          this.actionBtnValue = 'Completed'
        }
        else{
          this.actionBtnName = null
          this.actionBtnValue = null
        }
        console.log(this.rideDetails);
        
        this.originCoordinates = {
          'lat': res['ride']['pickup_location']['latitude'],
          'lon': res['ride']['pickup_location']['longitude']
        }
        this.destinCoordinates = {
          'lat': res['ride']['dropoff_location']['latitude'],
          'lon': res['ride']['dropoff_location']['longitude']
        }
        this.driverCoordinates = {
          'lat': res['ride']['driver']['user_details']['location']['latitude'],
          'lon': res['ride']['driver']['user_details']['location']['longitude']
        }
  
        if (this.originCoordinates && this.destinCoordinates) {
            resolve();
        }
      }).then(() => {
        if(res['ride']['status']['status'] == 'Accepted' || res['ride']['status']['status'] == 'Started') {
          this.initializeMap()
        }
        
      })
    })
  }

  getLocation() {
    this.backendService.getData('ride/ride_api?id='+this.rideId+'&action=location').subscribe((res) => {
      console.log(res);
      new Promise<void>((resolve) => {
        this.rideDetails = res['ride'];
        this.originCoordinates = {
          'lat': res['ride']['pickup_location']['latitude'],
          'lon': res['ride']['pickup_location']['longitude']
        }
        this.destinCoordinates = {
          'lat': res['ride']['dropoff_location']['latitude'],
          'lon': res['ride']['dropoff_location']['longitude']
        }
        this.driverCoordinates = {
          'lat': res['ride']['driver']['user_details']['location']['latitude'],
          'lon': res['ride']['driver']['user_details']['location']['longitude']
        }
  
        if (this.originCoordinates && this.destinCoordinates) {
            resolve();
        }
      }).then(() => {
        this.initializeMap()
      })
    })
  }

  initializeMap() {

    if (!this.originCoordinates || !this.originCoordinates.lat || !this.originCoordinates.lon) {
      this.toastr.error("Origin not selected")
      return
    }
    else if(!this.destinCoordinates || !this.destinCoordinates.lat || !this.destinCoordinates.lon) {
      this.toastr.error("Destination not selected")
      return
    }
    else{
      // Initialize the map with the origin coordinates
      this.map = L.map('map').setView([this.originCoordinates.lat, this.originCoordinates.lon], 13);
    
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
      L.Icon.Default.imagePath = '';
    
      this.map.eachLayer((layer:any) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });

      // Define custom icon instances for origin and destination markers
      const originIcon = L.icon(this.originIconOptions);
      const destinationIcon = L.icon(this.destinationIconOptions);
    
      // Add origin and destination markers with custom icons
      const options = {
        icon: 'leaf',
        iconShape: 'marker'
      };

      const originMarker = L.marker([this.originCoordinates.lat, this.originCoordinates.lon], {icon: originIcon, draggable:false}).addTo(this.map);
      const destinationMarker = L.marker([this.destinCoordinates.lat, this.destinCoordinates.lon], {icon: destinationIcon, draggable:false}).addTo(this.map);

      L.marker([Number(this.driverCoordinates['lat']), Number(this.driverCoordinates['lon'])], {icon: L.icon(this.rideIconOptions), draggable:false}).addTo(this.map).bindPopup(
        '<b>' + this.rideDetails['driver_vehicle_type'] + '</b><br>' +
        // '<small>' + element['time'] + ' away</small><br>' +
        '<b>₹' + this.rideDetails['amount'] + '</b>'
      );

      // Define latLngs for polyline
      const latLngs = [
        [this.originCoordinates.lat, this.originCoordinates.lon],
        [this.destinCoordinates.lat, this.destinCoordinates.lon]
      ];

      var control = L.Routing.control({
      show: false,
        waypoints: [
          L.latLng(this.originCoordinates.lat, this.originCoordinates.lon),
          L.latLng(this.destinCoordinates.lat, this.destinCoordinates.lon),
        ],
      routeWhileDragging: false,
      addWaypoints: false,
      waypointMode: 'connect', // or 'snap'
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving', // Change the profile to 'driving'
      }),
      }).addTo(this.map);

      var control = L.Routing.control({
      show: false,
        waypoints: [
          L.latLng(this.originCoordinates.lat, this.originCoordinates.lon),
          L.latLng(this.driverCoordinates.lat, this.driverCoordinates.lon),
        ],
      routeWhileDragging: false,
      addWaypoints: false,
      waypointMode: 'connect', // or 'snap'
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving', // Change the profile to 'driving'
      }),
      }).addTo(this.map);
      // Change stroke color to black for all routes
      document.querySelectorAll('.leaflet-pane .leaflet-overlay-pane svg path').forEach((path) => {
        path.setAttribute('stroke', 'black');
      });
    }
  }

  changeStatus() {
    let swaltext = ""
    let resulttext = ""
    let swaltitle = ""

    new Promise<void>((resolve) => {
      if (this.actionBtnValue == 'Start') {
        swaltitle = "Start Ride"
        swaltext = "Are you sure, do you want to start the ride"
        resulttext = "Ride started"
      }
      else if (this.actionBtnValue == 'Completed') {
        swaltitle = "Accept Ride"
        swaltext = "Do you want to accept the ride request"
        resulttext = "Ride accepted"
      }

      if (swaltitle != "") {
          resolve();
      }
    }).then(() => {
      swal({
        title: swaltitle,
        text: swaltext,
        icon: "warning",
        buttons: ["Cancel", "OK"],
        dangerMode: true,
      })
      .then((value) => {
        console.log(value, 'value');
        
        if (value) {
  
          this.backendService.putData(`ride/ride_api`, {'id':this.rideDetails['id'], 'status': this.actionBtnValue}).subscribe((res) => {
            if (res['detail'] === 'Success') {
              swal(resulttext, {
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
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }

}
