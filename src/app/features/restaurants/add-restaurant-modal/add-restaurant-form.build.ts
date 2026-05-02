import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/** Raw value shape from `buildAddRestaurantForm` (before API mapping). */
export interface AddRestaurantFormValue {
  name: string;
  categories: string;
  address: {
    country: string;
    state: string;
    city: string;
  };
  street: string;
  zipCode: string;
  instagram: string;
  images: string;
}

export function buildAddRestaurantForm(fb: FormBuilder): FormGroup {
  return fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    categories: ['', [Validators.required]],
    address: fb.group({
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
    }),
    street: ['', [Validators.required, Validators.minLength(2)]],
    zipCode: [''],
    instagram: [''],
    images: [''],
  });
}

export function emptyAddRestaurantFormValue(): AddRestaurantFormValue {
  return {
    name: '',
    categories: '',
    address: { country: '', state: '', city: '' },
    street: '',
    zipCode: '',
    instagram: '',
    images: '',
  };
}
