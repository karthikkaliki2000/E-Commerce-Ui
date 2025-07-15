import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  constructor() {}

  public setRoles(roles: []) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  public getRoles(): any {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : null;
  }

  public setToken(jwtToken: string) {
    localStorage.setItem('jwtToken', jwtToken);
  }

  public getToken(): any {
    const token = localStorage.getItem('jwtToken');
    return token ? token : null; // return null if token is not found
  }

  public clear() {
    localStorage.clear();
  }

  public isUserLoggedIn(): boolean {
    const isUserLoggedIn = this.getToken() && this.getRoles();

    return isUserLoggedIn;
  }

  public isUser(): boolean {
    const roles: any[] = this.getRoles();
    return roles[0].role_name === 'ROLE_USER'; // check if user has user
  }

  public isAdmin(): boolean {
    const roles: any[] = this.getRoles();

    return roles[0].role_name === 'ROLE_ADMIN'; // check if user has admin
  }

  public getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }
}
