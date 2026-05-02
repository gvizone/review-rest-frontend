import { DestroyRef, Injectable, WritableSignal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import type { ICity, ICountry, IState } from '@countrystatecity/countries';
import { from } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { LocationDataService } from './location-data.service';

export interface AddressCascadeLists {
  countries: WritableSignal<ICountry[]>;
  states: WritableSignal<IState[]>;
  cities: WritableSignal<ICity[]>;
}

/**
 * Wires country → state → city reactive lists for a nested address `FormGroup`
 * (`country`, `state`, `city` controls). Single place for cascade logic (DRY with register, etc.).
 */
@Injectable({ providedIn: 'root' })
export class AddressFormCascadeService {
  private readonly locationData = inject(LocationDataService);

  connect(address: FormGroup, lists: AddressCascadeLists, destroyRef: DestroyRef): void {
    void this.locationData
      .getCountries()
      .then((list) =>
        lists.countries.set([...list].sort((a, b) => a.name.localeCompare(b.name))),
      );

    const untilDestroyed = takeUntilDestroyed(destroyRef);

    address.controls['country'].valueChanges
      .pipe(
        untilDestroyed,
        distinctUntilChanged(),
        tap(() => {
          address.patchValue({ state: '', city: '' }, { emitEvent: false });
          lists.states.set([]);
          lists.cities.set([]);
        }),
        switchMap((countryName) => {
          const c = lists.countries().find((x) => x.name === countryName);
          if (!c) return from(Promise.resolve([] as IState[]));
          return from(this.locationData.getStatesOfCountry(c));
        }),
      )
      .subscribe((states) =>
        lists.states.set([...states].sort((a, b) => a.name.localeCompare(b.name))),
      );

    address.controls['state'].valueChanges
      .pipe(
        untilDestroyed,
        distinctUntilChanged(),
        tap(() => {
          address.patchValue({ city: '' }, { emitEvent: false });
          lists.cities.set([]);
        }),
        switchMap((stateName) => {
          const countryName = address.controls['country'].value;
          const c = lists.countries().find((x) => x.name === countryName);
          const s = lists.states().find((x) => x.name === stateName);
          if (!c || !s) return from(Promise.resolve([] as ICity[]));
          return from(this.locationData.getCitiesOfState(c, s));
        }),
      )
      .subscribe((cities) =>
        lists.cities.set([...cities].sort((a, b) => a.name.localeCompare(b.name))),
      );
  }
}
