import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../_model/address.model';
import { UserAuthService } from './user-auth.service';


@Injectable({ providedIn: 'root' })
export class AddressService {
  private baseUrl = 'http://localhost:9090/profile/addresses';

  constructor(private http: HttpClient, public authService:UserAuthService) {}

  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(this.baseUrl);
  }

  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/${id}`);
  }

  getDefault(): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/default`);
  }

  add(address: Address): Observable<string> {
    return this.http.post(this.baseUrl, address, { responseType: 'text' });
  }

  update(id: number, address: Address): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, address, { responseType: 'text' });
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

 setDefault(id: number): Observable<string> {
  return this.http.patch(`${this.baseUrl}/${id}/default`, null, {
    responseType: 'text',
    
  });
}


 

}
