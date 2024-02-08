import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseComponent } from './layout/base/base.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UserListComponent } from './user-list/user-list.component';
import { AuthGuard } from './auth.guard';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserAddComponent } from './user-add/user-add.component';

const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    children: [
      // {
      //   path: '',
      //   component: DashboardComponent
      // },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'profile',
        component: UserProfileComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'user-list',
        component: UserListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'add-user',
        component: UserAddComponent,
        canActivate: [AuthGuard]
      },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
