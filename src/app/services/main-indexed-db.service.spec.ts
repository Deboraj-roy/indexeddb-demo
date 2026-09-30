import { TestBed } from '@angular/core/testing';

import { MainIndexedDbService } from './main-indexed-db.service';

describe('MainIndexedDbService', () => {
  let service: MainIndexedDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainIndexedDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
