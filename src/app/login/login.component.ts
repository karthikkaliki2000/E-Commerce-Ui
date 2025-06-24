import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';
import { UserAuthService } from '../_services/user-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  ngOnInit(): void {}

  constructor(
    private userService: UserService,
    private router: Router,
    private userAuthService: UserAuthService
  ) {}

  login(loginForm: NgForm) {
    if (loginForm.valid) {
      console.log('Logged in method');
      this.userService.login(loginForm.value).subscribe(
        (response: any) => {
          console.log('Login successful', response);
          // Assuming the response contains a JWT token and user roles
          this.userAuthService.setToken(response.jwtToken);
          this.userAuthService.setRoles(response.user.roles);
          // Navigate to the dashboard or home page after successful login
          const role = response.user.roles[0].role_name;

          if (role === 'ROLE_ADMIN') {
            this.router.navigate(['/admin']);
          } else if (role === 'ROLE_USER') {
            this.router.navigate(['/user']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          console.error('Login failed', error);

          // Handle login error, e.g., show an error message
          this.router.navigate(['/forbidden']);
        }
      );

      // Reset the form after submission
      loginForm.reset();
    }
  }
}
