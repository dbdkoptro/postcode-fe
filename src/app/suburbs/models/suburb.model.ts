import { BehaviorSubject, Observable } from 'rxjs';

export interface Suburb {
  name: string;
  postcode: number;
  state: {
    name: string;
    abbreviation: string;
  };
  locality: string;
  latitude: number;
  longitude: number;
}

export interface SuburbOption {
  suburb: Suburb;
  neighbours: Observable<Suburb[]>;
  isLoading$: BehaviorSubject<boolean>;
}
