import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent {
  first_name = null
  last_name = null
  email = null
  mobile = null
  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  constructor(
    private backendService: BackendService,
    private router: Router,
  ) {}
  ngOnInit() {
    this.LoadFilters()
  }
  
  LoadFilters() {
    this.backendService.getDataBeforeLogin('load_filters').subscribe((res) => {
    });
  }
}
