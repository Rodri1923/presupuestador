import { describe, it, expect } from 'vitest';
import { leerNumero, formatearPesos } from './numeros';

describe('leerNumero', () => {
  it('lee enteros y miles con punto', () => {
    expect(leerNumero('12')).toBe(12);
    expect(leerNumero('1.500')).toBe(1500);
    expect(leerNumero('1.250.000')).toBe(1250000);
  });
  it('lee decimales con coma', () => {
    expect(leerNumero('18,50')).toBe(18.5);
    expect(leerNumero('1.500,75')).toBe(1500.75);
    expect(leerNumero(' 2,5 ')).toBe(2.5);
  });
  it('rechaza lo que no es número', () => {
    expect(leerNumero('')).toBeNull();
    expect(leerNumero('abc')).toBeNull();
    expect(leerNumero('1.50')).toBeNull();
    expect(leerNumero('1,2,3')).toBeNull();
  });
});

describe('formatearPesos', () => {
  it('usa punto de miles y coma decimal', () => {
    expect(formatearPesos(1500.5)).toBe('1.500,50');
  });
});
