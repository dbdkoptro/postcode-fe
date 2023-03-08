import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { Suburb } from '../models/suburb.model';
import { suburbsMock } from './suburb.mock';

@Injectable({
  providedIn: 'root'
})
export class SuburbService {
  private endpointUrl = '/suburbs.json';

  constructor(private http: HttpClient) {}

  public getSuburbsByPostCode(postCode: number): Observable<Suburb[]> {
    return of(suburbsMock).pipe(
      map(suburbs => suburbs.sort((a, b) => a.name.localeCompare(b.name)))
    );

    // return this.http.get<Suburb[]>(this.endpointUrl, {
    //   params: { postcode: postCode }
    // });
  }

  public getNeighbourSuburbs(suburb: Suburb): Observable<Suburb[]> {
    return of(suburbsMock).pipe(
      map(suburbs => suburbs.sort((a, b) => a.name.localeCompare(b.name))),
      delay(1000)
    );
  }
}
