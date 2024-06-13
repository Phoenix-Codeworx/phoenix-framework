import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { User } from '../src/user';

describe('User Class Metadata', () => {
  it('should have metadata for name and email', () => {
    console.log('Metadata for name:', Reflect.getMetadata('design:type', User.prototype, 'name'));
    console.log('Metadata for email:', Reflect.getMetadata('design:type', User.prototype, 'email'));

    expect(Reflect.getMetadata('design:type', User.prototype, 'name')).toBe(String);
    expect(Reflect.getMetadata('design:type', User.prototype, 'email')).toBe(String);
  });
});
