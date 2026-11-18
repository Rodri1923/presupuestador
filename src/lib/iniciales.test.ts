import { describe, expect, it } from 'vitest';
import { iniciales } from './iniciales';

describe('iniciales', () => {
  it('toma la primera y la última palabra', () => {
    expect(iniciales('Sanitaria Pérez')).toBe('SP');
    expect(iniciales('Sanitaria Pérez e Hijos')).toBe('SH');
  });
  it('saltea conectores', () => {
    expect(iniciales('Sanitaria de la Costa')).toBe('SC');
  });
  it('con una sola palabra usa dos letras', () => {
    expect(iniciales('pérez')).toBe('PÉ');
  });
  it('sin nombre muestra ?', () => {
    expect(iniciales('   ')).toBe('?');
  });
});
