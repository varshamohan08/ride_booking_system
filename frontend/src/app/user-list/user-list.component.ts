import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';

interface UserDetails {
  user_type: string,
  user:{
    username: string
  },
  mobile:string,
  first_name:string,
  last_name:string,
  email:string
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  
  userList: UserDetails[] = [];
  paginatedUsers: UserDetails[] = [];
  paginator: { currentPage: number, lastPage: number, pages: number[] } = { currentPage: 1, lastPage: 1, pages: [] };
  searchText: string = '';

  constructor(
    private backendService: BackendService,
    private router: Router,
    ) {}

  ngOnInit() {
    this.userData()
  }

  userData() {
    this.backendService.getData('user_api').subscribe((res) => {
      console.log(res);

      this.paginatedUsers = res['results']['users'];
      this.paginator = { currentPage: 1, lastPage: res['results']['last_page'], pages: Array.from({ length: res['results']['last_page'] }, (_, i) => i + 1) };
    }, (error) => {
      console.error(error);
    });
  }

  changePage(page: number) {
    this.backendService.getData(`user_api?page=${page}`).subscribe((res) => {
      console.log(res);
      this.userList = res['results']['users']
      this.paginatedUsers = res['results']['users'];
      this.paginator.currentPage = page;
    }, (error) => {
      console.error(error);
    });
  }
  
  applyFilter() {
    console.log('apply filter', this.searchText);
    
    // Filter the user list based on the search text
    this.paginatedUsers = this.userList.filter(user => {
      // Customize the conditions for your search
      console.log(user.user_type.toLowerCase().includes(this.searchText.toLowerCase()), 'f');
      
      return (
        user.user_type.toLowerCase().search(this.searchText.toLowerCase()) ||
        user.user.username.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.first_name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.mobile.toLowerCase().includes(this.searchText.toLowerCase())
      );
    });
    console.log(this.paginatedUsers);
    
  }
}
