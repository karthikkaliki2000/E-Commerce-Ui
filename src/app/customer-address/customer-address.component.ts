import { Component, OnInit } from '@angular/core';
import { AddressService } from '../_services/address.service';
import { Address } from '../_model/address.model';

@Component({
  selector: 'app-customer-address',
  templateUrl: './customer-address.component.html',
  styleUrls: ['./customer-address.component.css']
})
export class CustomerAddressComponent implements OnInit {
  addresses: Address[] = [];
  selected: Address = this.emptyAddress();
  statusMessage = '';
  editing = false;
  loading = true;
  isDefault = false;

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    
    this.loading = true;
    this.addressService.getAll().subscribe({
      next: data => {
        console.log(JSON.stringify(data)+"----------------------backend data");
        this.addresses = data;
         console.log(JSON.stringify(this.addresses)+"----------------------frontend data");
        this.loading = false;
        this.isDefault = this.addresses.some(a => a.default);
      },
      error: err => {
        this.statusMessage = `❌ Failed to load addresses: ${err.message}`;
        this.loading = false;
      }
    });
  }

  save(): void {
    const action = this.editing
      ? this.addressService.update(this.selected.id!, this.selected)
      : this.addressService.add(this.selected);

    action.subscribe({
      next: msg => {
        this.statusMessage = `✅ ${msg}`;
        this.resetForm();
        this.loadAddresses();
      },
      error: err => this.statusMessage = `❌ ${err.message}`
    });
  }

  edit(address: Address): void {
    this.selected = { ...address };
    this.editing = true;
  }

  delete(id: number): void {
    this.addressService.delete(id).subscribe({
      next: msg => {
        this.statusMessage = `🗑️ ${msg}`;
        this.loadAddresses();
      },
      error: err => this.statusMessage = `❌ ${err.message}`
    });
  }

  toggleDefault(id: number): void {
    this.addressService.setDefault(id).subscribe({
      next: msg => {
        this.statusMessage = `⭐ ${msg}`;
        this.loadAddresses();
      },
      error: err => this.statusMessage = `❌ ${err.message}`
    });
  }

  resetForm(): void {
    this.selected = this.emptyAddress();
    this.editing = false;
  }

  emptyAddress(): Address {
    return {
      label: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      default: false,
      fullName: '',
      email: '',
      contactNumber: '',
      alternativeContactNumber: ''
    };
  }
}
