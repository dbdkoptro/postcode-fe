import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, filter, map, Observable, of } from 'rxjs';
import { isEqualSuburb } from '../helpers/suburb.helper';
import { Suburb } from '../models/suburb.model';

@Injectable({
  providedIn: 'root'
})
export class SuburbService {
  private suburbsEndpoint = '/suburbs.json';
  private radiusEndpoint = '/radius.json';

  constructor(private http: HttpClient) {}

  public getSuburbsByPostCode(postCode: number): Observable<Suburb[]> {
    return this.http
      .get<Suburb[]>(this.suburbsEndpoint, {
        params: { postcode: postCode }
      })
      .pipe(
        map(suburbs => suburbs.sort(this.compareSuburbs)),
        catchError(() => of([]))
      );
  }

  public getNeighbourSuburbs(suburb: Suburb): Observable<Suburb[]> {
    return this.http
      .get<Suburb[]>(this.radiusEndpoint, {
        params: {
          distance: 4000,
          latitude: suburb.latitude,
          longitude: suburb.longitude
        }
      })
      .pipe(
        map(suburbs =>
          suburbs
            .filter(neighbour => !isEqualSuburb(suburb, neighbour))
            .sort(this.compareSuburbs)
        ),
        catchError(() => of([]))
      );
  }

  private compareSuburbs(a: Suburb, b: Suburb): number {
    return a.name.localeCompare(b.name);
  }
}
