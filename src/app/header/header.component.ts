import { Component } from '@angular/core';
import { UserAuthService } from '../_services/user-auth.service';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(
    private userAuthService: UserAuthService,
    private router: Router,
    public userService: UserService
  ) {}

  public isUserLoggedIn(): boolean {
    return this.userAuthService.isUserLoggedIn();
  }

  public logout() {
    this.userAuthService.clear();

    // Optionally, you can navigate to the home page or login page after logout
    this.router.navigate(['/']);
    //window.location.reload(); // Reload the page to reflect the changes
  }

  public isAdmin() {
   
    return this.userAuthService.isAdmin();
  }

  public isUser() {
    return this.userAuthService.isUser();
  }

  timestamp = Date.now();

  onAddProductClick() {
    this.timestamp = Date.now();
  }

  showMobileMenu = false;

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  isMobileScreen(): boolean {
    return window.innerWidth <= 600;
  }
}
