import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GooglePlacesService } from './google-places.service';

describe('GooglePlacesService', () => {
  let service: GooglePlacesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GooglePlacesService]
    });
    service = TestBed.inject(GooglePlacesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});