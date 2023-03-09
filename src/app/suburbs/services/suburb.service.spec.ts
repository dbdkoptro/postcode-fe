import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SuburbService } from './suburb.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Suburb } from '../models/suburb.model';
import { of } from 'rxjs';
import { isEqualSuburb } from '../helpers/suburb.helper';

describe('SuburbService', () => {
  let service: SuburbService;

  const suburbMocked1: Suburb = {
    name: 'Burnley',
    postcode: 3121,
    state: {
      name: 'Victoria',
      abbreviation: 'VIC'
    },
    locality: 'MOORABBIN',
    latitude: -37.8229,
    longitude: 145.004
  };

  const suburbMocked2: Suburb = {
    name: 'Albert Park',
    postcode: 3206,
    state: {
      name: 'Victoria',
      abbreviation: 'VIC'
    },
    locality: 'MOORABBIN',
    latitude: -37.8463,
    longitude: 144.9631
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SuburbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should order getSuburbsByPostCode by name', fakeAsync(() => {
    let response: Suburb[] = [];

    spyOn(service['http'], 'get').and.returnValue(
      of([suburbMocked1, suburbMocked2])
    );
    service.getSuburbsByPostCode(1234).subscribe(result => (response = result));

    tick();

    expect(isEqualSuburb(response[0], suburbMocked2)).toBeTruthy();
  }));

  it('should order getNeighbourSuburbs by name', fakeAsync(() => {
    let response: Suburb[] = [];

    spyOn(service['http'], 'get').and.returnValue(
      of([suburbMocked1, suburbMocked2])
    );
    service
      .getNeighbourSuburbs(suburbMocked1)
      .subscribe(result => (response = result));

    tick();

    expect(isEqualSuburb(response[0], suburbMocked2)).toBeTruthy();
  }));

  it('should call getSuburbsByPostCode with the right params', fakeAsync(() => {
    spyOn(service['http'], 'get').and.returnValue(
      of([suburbMocked1, suburbMocked2])
    );

    service.getSuburbsByPostCode(1234).subscribe();

    tick();

    expect(service['http'].get).toHaveBeenCalledWith(
      service['suburbsEndpoint'],
      {
        params: {
          postcode: 1234
        }
      }
    );
  }));

  it('should call getNeighbourSuburbs with the right params', fakeAsync(() => {
    spyOn(service['http'], 'get').and.returnValue(
      of([suburbMocked1, suburbMocked2])
    );

    service.getNeighbourSuburbs(suburbMocked1).subscribe();

    tick();

    expect(service['http'].get).toHaveBeenCalledWith(
      service['radiusEndpoint'],
      {
        params: {
          distance: 4000,
          latitude: suburbMocked1.latitude,
          longitude: suburbMocked1.longitude
        }
      }
    );
  }));
});
