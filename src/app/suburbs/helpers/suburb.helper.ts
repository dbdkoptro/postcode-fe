import { Suburb } from '../models/suburb.model';

export function isEqualSuburb(a: Suburb, b: Suburb): boolean {
  return (
    a.name === b.name &&
    a.postcode === b.postcode &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude
  );
}
