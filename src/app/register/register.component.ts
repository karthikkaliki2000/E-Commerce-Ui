import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private userService: UserService, private router: Router) {}
  register(registerForm: NgForm) {
    // TODO: Implement registration logic
    console.log('Register form submitted:', registerForm.value);
    this.userService.register(registerForm.value).subscribe(
      (response: any) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      (error: any) => {
        console.error('Registration failed:', error);
      }
    );
  }
}
