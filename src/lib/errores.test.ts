import { describe, it, expect } from 'vitest';
import { mensajeDeError } from './errores';

describe('mensajeDeError', () => {
  it('traduce credenciales incorrectas', () => {
    expect(mensajeDeError(new Error('Invalid login credentials'))).toBe('El mail o la contraseña no son correctos.');
  });
  it('avisa si no hay internet', () => {
    expect(mensajeDeError(new TypeError('Failed to fetch'))).toMatch(/conexión/);
  });
  it('da un mensaje genérico para lo desconocido', () => {
    expect(mensajeDeError('xyz')).toMatch(/Algo salió mal/);
  });
});
