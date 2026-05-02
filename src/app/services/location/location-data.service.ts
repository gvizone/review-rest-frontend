import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import type { ICity, ICountry, IState } from '@countrystatecity/countries';

/** Mirrors folder names under `@countrystatecity/countries/dist/data`. */
function countryDataDir(c: Pick<ICountry, 'name' | 'iso2'>): string {
  return `${c.name.replace(/\s+/g, '_')}-${c.iso2}`;
}

function stateDataDir(s: Pick<IState, 'name' | 'iso2'>): string {
  return `${s.name.replace(/\s+/g, '_')}-${s.iso2}`;
}

/**
 * Loads the same JSON shipped with `@countrystatecity/countries` via HTTP.
 * The package's Node `fs` loaders do not run in the browser; copying `dist/data`
 * to app assets keeps bundle compatibility while using the same dataset.
 */
@Injectable({ providedIn: 'root' })
export class LocationDataService {
  private readonly doc = inject(DOCUMENT);

  private countriesCache: ICountry[] | null = null;
  private readonly statesCache = new Map<string, IState[]>();
  private readonly citiesCache = new Map<string, ICity[]>();

  private resolveUrl(relativePath: string): string {
    return new URL(`csc-data/${relativePath}`, this.doc.baseURI).toString();
  }

  private async fetchJson<T>(relativePath: string): Promise<T> {
    const res = await fetch(this.resolveUrl(relativePath));
    if (!res.ok) {
      throw new Error(`Failed to load ${relativePath} (${res.status})`);
    }
    return res.json() as Promise<T>;
  }

  async getCountries(): Promise<ICountry[]> {
    if (this.countriesCache) return this.countriesCache;
    const list = await this.fetchJson<ICountry[]>('countries.json');
    this.countriesCache = list;
    return list;
  }

  async getStatesOfCountry(country: ICountry): Promise<IState[]> {
    const key = country.iso2;
    const cached = this.statesCache.get(key);
    if (cached) return cached;

    const dir = countryDataDir(country);
    try {
      const states = await this.fetchJson<IState[]>(`${dir}/states.json`);
      this.statesCache.set(key, states);
      return states;
    } catch {
      this.statesCache.set(key, []);
      return [];
    }
  }

  async getCitiesOfState(country: ICountry, state: IState): Promise<ICity[]> {
    const key = `${country.iso2}:${state.iso2}`;
    const cached = this.citiesCache.get(key);
    if (cached) return cached;

    const path = `${countryDataDir(country)}/${stateDataDir(state)}/cities.json`;
    try {
      const cities = await this.fetchJson<ICity[]>(path);
      this.citiesCache.set(key, cities);
      return cities;
    } catch {
      this.citiesCache.set(key, []);
      return [];
    }
  }
}
