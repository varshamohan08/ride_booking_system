import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { BackendService } from 'src/app/backend.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  savedDarkMode = '';
  userType = localStorage.getItem('user_type')
  userName = localStorage.getItem('username')

  constructor(
    private cdr: ChangeDetectorRef,
    private backendService: BackendService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cdr.detectChanges();
    let savedDarkMode = localStorage.getItem('darkMode');

    if (savedDarkMode === 'true') {
      console.log('darkmode');
      
        this.toggleDarkMode();
    }
  }

  toggleDarkMode() {
    console.log('in');
    const body = document.body;
    body.classList.toggle('dark');

    // Save the user's preference to local storage
    const isDarkMode = body.classList.contains('dark');
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

    // Update savedDarkMode as a string
    this.savedDarkMode = isDarkMode.toString();
    console.log(this.savedDarkMode);
    this.updateDarkModeIcon();
  }
  updateDarkModeIcon() {
    const darkLayout = document.querySelector('.dark-layout') as HTMLElement | null;
    const lightLayout = document.querySelector('.light-layout') as HTMLElement | null;
  
    if (darkLayout && lightLayout) {
      if (document.body.classList.contains('dark')) {
        darkLayout.style.display = 'none';
        lightLayout.style.display = 'block';
      } else {
        darkLayout.style.display = 'block';
        lightLayout.style.display = 'none';
      }
    } else {
      console.error("Either 'dark-layout' or 'light-layout' element not found.");
    }
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
  
  
}
