export interface Address {
  id?: number;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  default: boolean;
  fullName?: string;
  email?: string;
  contactNumber?: string;
  alternativeContactNumber?: string;
}
