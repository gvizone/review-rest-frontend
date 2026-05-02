import { FormBuilder, FormGroup, Validators, type ValidatorFn } from '@angular/forms';

export interface CreateReviewFormValue {
  service: number;
  food: number;
  value: number;
  atmosphere: number;
  commentary: string;
  images: string;
}

export function buildCreateReviewForm(fb: FormBuilder): FormGroup {
  const score = (): [number, ValidatorFn[]] => [
    4,
    [Validators.required, Validators.min(1), Validators.max(5)],
  ];
  return fb.group({
    service: score(),
    food: score(),
    value: score(),
    atmosphere: score(),
    commentary: [''],
    images: [''],
  });
}

export function emptyCreateReviewFormValue(): CreateReviewFormValue {
  return {
    service: 4,
    food: 4,
    value: 4,
    atmosphere: 4,
    commentary: '',
    images: '',
  };
}
