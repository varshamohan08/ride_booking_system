import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GeolocationService } from '../geolocation.service';
import { Observable } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import swal from 'sweetalert';
import { IconOptions, PointExpression } from 'leaflet';
import { BackendService } from '../backend.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-request-ride',
  templateUrl: './request-ride.component.html',
  styleUrls: ['./request-ride.component.scss']
})
export class RequestRideComponent {


  @ViewChild('myMap', { static: false }) myMap: any; // Assuming 'myMap' is the template reference variable name

  iconPath: string = '../../assets/icons/location-pin.png';
  destinIconPath: string = '../../assets/icons/destination.png';
  carIconPath: string = '../../assets/icons/car.png';
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

  locationControl = new FormControl();
  locations: any[] = []; // Your array of locations
  filteredLocations: any[] = []; // Filtered array of locations based on input

  // zoom = 4;
  locationName:any;
  coordinates: { lat: number, lng: number } | null = null;
  apiKey: string = 'AIzaSyBhCq3inYOR8fXDLtCAqhq_7B-Epze1oyY';
  destinLocationName:any;
  originCoordinates:any;
  destinCoordinates:any;

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
  availableRides: any[] = [];
  activeRowIndex: number = 0;
  carName:any;
  driverId: any;

  blnBookRides = false

 
  setActiveRow(index: number) {
      this.activeRowIndex = index;
      this.carName = this.availableRides[index]['type']
  }


  constructor(
    private http: HttpClient,
    private locationService: GeolocationService,
    private backendService: BackendService,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {

    // this.filteredLocations = this.locations;
    this.directionsResults = Observable<google.maps.DirectionsResult|undefined>

  }

  onLocationSelected(event: any): void {

    new Promise<void>((resolve, reject) => {
      console.log('Selected location:', event);
      this.locationName = event.display_name
      this.originCoordinates= {
        'lat':Number(event.lat),
        'lon':Number(event.lon)
      }

      console.log(this.originCoordinates);

      if (this.destinCoordinates) {
          resolve();
      } else {
          reject('destinCoordinates are not defined');
      }
    })
    .then(() => {
        this.initializeMap();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }
  onDestinLocationSelected(event: any): void {

    new Promise<void>((resolve, reject) => {
        console.log('Selected location:', event);

        this.destinLocationName = event.display_name;
        this.destinCoordinates = {
            lat: Number(event.lat),
            lon: Number(event.lon)
        };

        if (this.destinCoordinates) {
            resolve();
        } else {
            reject('destinCoordinates are not defined');
        }
    })
    .then(() => {
        this.initializeMap();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
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
      document.querySelectorAll('.leaflet-pane .leaflet-overlay-pane svg path').forEach((path) => {
        path.setAttribute('stroke', 'black');
      });
    }
  }

  shareLocation() {
    this.locationService.getLocation().then(() => {
      this.locationName = localStorage.getItem('latitude') +', '+ localStorage.getItem('longitude')
      this.originCoordinates= {
        'lat':Number(localStorage.getItem('latitude')),
        'lon':Number(localStorage.getItem('longitude'))
      }

      console.log(this.originCoordinates);
    });
  }

  findCoordinates(locationName:any) {
    // if (!this.locationName) return;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&countrycodes=IN`
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(this.locationName)}&key=${this.apiKey}`;

    this.http.get<any>(url).subscribe(
      (data) => {
        console.log(data,'data');
        
        if (data && data.length > 0) {
          this.locations = data
          this.filteredLocations = data
          // const location = data.results[0].geometry.location;
        } else {
          console.error('No coordinates found for the entered location.');
        }
      },
      (error) => {
        console.error('Error fetching coordinates:', error);
      }
    );
  }


  checkRides() {
    let dctData = {
      'pickup_location':this.originCoordinates,
      'dropoff_location': this.destinCoordinates
    }
    this.backendService.postData('ride/request_ride', dctData).subscribe((res) => {
      if (res['detail'] != 'Success') {
        this.toastr.error(res['detail'])
      }
      else {
        // const rideIcon = L.icon(this.rideIconOptions);
        this.availableRides = res['rides']
        this.carName= res['rides'][0]['type']
        res['rides'].forEach((element:any) => {
          console.log(element);
          L.marker([Number(element['location']['latitude']), Number(element['location']['longitude'])], {icon: L.icon(this.rideIconOptions), draggable:false}).addTo(this.map).bindPopup(
            '<b>' + element['type'] + '</b><br>' +
            '<small>' + element['time'] + ' away</small><br>' +
            '<b>₹' + element['amount'] + '</b>'
          );
          this.map.invalidateSize();
          
        });
        // swal("Suuccessfully updated", {
        //   icon: "success",
        // }).then(() => {
        //   window.location.reload();
        // });
      }
    })
  }

  bookRides() {
    this.blnBookRides = true
    this.spinner.show("mySpinner", {
      type: "line-scale-party",
      size: "large",
      bdColor: "rgba(0, 0, 0, 1)",
      color: "white",
      template:
        "<img src='assets/gif/car-toy.gif' />",
    });
    let dctData = {
      'pickup_location': {'latitude': this.originCoordinates['lat'], 'longitude': this.originCoordinates['lon'], 'name': this.locationName},
      'dropoff_location': {'latitude': this.destinCoordinates['lat'], 'longitude': this.destinCoordinates['lon'], 'name': this.destinLocationName},
      'driver_id': this.availableRides[this.activeRowIndex]['driver']['id'],
      'amount': this.availableRides[this.activeRowIndex]['amount']
    }
    this.backendService.postData('ride/ride_api', dctData).subscribe((res) => {
      this.spinner.hide()
      this.blnBookRides = false
      
      
      if (res['detail'] != 'Success') {
        this.toastr.error(res['detail'])
      }
      else {
        swal("Booked successfully", {
          icon: "success",
        }).then(() => {
          this.router.navigate(['myrides'])
        });
      }
    },
    (error)=> {
      this.spinner.hide()
      this.blnBookRides = false
      this.toastr.error(error)
    })
  }
}
