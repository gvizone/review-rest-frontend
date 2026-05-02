import type { Address } from './address.model';

export interface CreateUserRequest {
  name: string;
  email: string;
  address: Address;
  /** Data URL or base64 from uploaded image (optional). */
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  address: Address;
  image?: string;
}
