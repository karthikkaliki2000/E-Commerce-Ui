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
    const userRoles: any = this.userAuthService.getRoles();
    if (!userRoles) return false;
    return userRoles.some((role: any) => allowedRoles.includes(role.role_name));
  }

  public register(registerData: any) {
    return this.http.post(this.PATH_OF_API + '/api/register', registerData);
  }
}
