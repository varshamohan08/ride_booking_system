import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BaseComponent } from './layout/base/base.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { UserAddComponent } from './user-add/user-add.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { GeolocationService } from './geolocation.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    BaseComponent,
    NavbarComponent,
    LoginComponent,
    SignupComponent,
    UserListComponent,
    UserProfileComponent,
    UserAddComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    HttpClientModule,
    MatSelectModule,
    ToastrModule.forRoot(),
    NgbModule,
  ],
  providers: [
    ToastrService,
    GeolocationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
