import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserAuthService } from './user-auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  PATH_OF_API = 'http://localhost:9090';
  requestHeader = new HttpHeaders({
    'Content-Type': 'application/json',
    'No-Auth': 'True', // No authentication required for login
  });

  constructor(
    private http: HttpClient,
    private userAuthService: UserAuthService
  ) {}

  public login(loginData: any) {
    return this.http.post(this.PATH_OF_API + '/authenticate', loginData, {
      headers: this.requestHeader,
    });
  }

  public forUser() {
    return this.http.get(this.PATH_OF_API + '/api/forUser', {
      responseType: 'text',
    });
  }

  public forAdmin() {
    return this.http.get(this.PATH_OF_API + '/api/forAdmin', {
      responseType: 'text',
    });
  }

  public roleMatch(allowedRoles: any): boolean {
    // Placeholder implementation, always returns false
    let isMatch = false;
    const userRoles: any = this.userAuthService.getRoles();
    if (userRoles != null && userRoles) {
      for (let i = 0; i < userRoles.length; i++) {
        for (let j = 0; j < allowedRoles.length; j++) {
          if (userRoles[i].role_name == allowedRoles[j]) {
            isMatch = true;
            break;
          } else {
            isMatch = false;
          }
        }
      }
    }
    return isMatch;
  }

  public register(registerData: any) {
    return this.http.post(this.PATH_OF_API + '/api/register', registerData);
  }
}
