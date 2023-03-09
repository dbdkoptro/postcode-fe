import { TestBed } from '@angular/core/testing';

import { SuburbService } from './suburb.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SuburbService', () => {
  let service: SuburbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SuburbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
