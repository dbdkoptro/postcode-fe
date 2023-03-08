import { TestBed } from '@angular/core/testing';

import { SuburbService } from './suburb.service';

describe('SuburbService', () => {
  let service: SuburbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuburbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
