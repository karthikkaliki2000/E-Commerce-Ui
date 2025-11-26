import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  constructor() {}

  // Token
  public setToken(jwtToken: string): void {
    localStorage.setItem('jwtToken', jwtToken);
  }

  public getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  public removeToken(): void {
    localStorage.removeItem('jwtToken');
  }

  // Roles
  public setRoles(roles: any[]): void {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  public getRoles(): any[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  public removeRoles(): void {
    localStorage.removeItem('roles');
  }

  // Username from JWT
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

  // Full name from JWT (if included as claim)
  public getFullName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.fullName || null;
    } catch {
      return null;
    }
  }

  // Email from JWT (if included as claim)
  public getEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || null;
    } catch {
      return null;
    }
  }

  // Role checks
  public isUser(): boolean {
    return this.getRoles().some(role => role.role_name === 'ROLE_USER');
  }

  public isAdmin(): boolean {
    return this.getRoles().some(role => role.role_name === 'ROLE_ADMIN');
  }

  // Login status
  public isUserLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Clear all
  public clear(): void {
    localStorage.clear();
  }
}
