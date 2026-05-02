import type { Restaurant } from '../models';

export function restaurantLocationLine(r: Restaurant): string {
  const a = r.address;
  const parts = [a.street, a.city, a.state, a.country].filter(Boolean);
  return parts.join(', ');
}

export function restaurantAddressBlock(r: Restaurant): string {
  const a = r.address;
  const lines: string[] = [];
  if (a.street) lines.push(a.street);
  lines.push([a.city, a.state].filter(Boolean).join(', '));
  lines.push(a.country);
  if (a.zipCode) lines.push(a.zipCode);
  return lines.filter(Boolean).join('\n');
}
