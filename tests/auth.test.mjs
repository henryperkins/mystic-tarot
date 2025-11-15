/**
 * Tests for authentication utilities
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateId,
  isValidEmail,
  isValidUsername,
  validatePassword
} from '../functions/lib/auth.js';

describe('Authentication Utilities', () => {
  describe('Password hashing', () => {
    it('should hash passwords consistently', async () => {
      const password = 'test123456';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      assert.strictEqual(hash1, hash2, 'Same password should produce same hash');
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1');
      const hash2 = await hashPassword('password2');
      
      assert.notStrictEqual(hash1, hash2, 'Different passwords should produce different hashes');
    });

    it('should verify correct passwords', async () => {
      const password = 'mysecretpassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      assert.strictEqual(isValid, true, 'Correct password should verify');
    });

    it('should reject incorrect passwords', async () => {
      const password = 'mysecretpassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('wrongpassword', hash);
      
      assert.strictEqual(isValid, false, 'Incorrect password should not verify');
    });
  });

  describe('Token generation', () => {
    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      
      assert.notStrictEqual(token1, token2, 'Tokens should be unique');
      assert.strictEqual(token1.length, 64, 'Token should be 64 characters (32 bytes hex)');
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      assert.notStrictEqual(id1, id2, 'IDs should be unique');
      assert.ok(id1.includes('-'), 'ID should contain timestamp and random part');
    });
  });

  describe('Email validation', () => {
    it('should accept valid emails', () => {
      assert.strictEqual(isValidEmail('user@example.com'), true);
      assert.strictEqual(isValidEmail('test.user@domain.co.uk'), true);
      assert.strictEqual(isValidEmail('user+tag@example.com'), true);
    });

    it('should reject invalid emails', () => {
      assert.strictEqual(isValidEmail('notanemail'), false);
      assert.strictEqual(isValidEmail('missing@domain'), false);
      assert.strictEqual(isValidEmail('@example.com'), false);
      assert.strictEqual(isValidEmail('user@'), false);
    });
  });

  describe('Username validation', () => {
    it('should accept valid usernames', () => {
      assert.strictEqual(isValidUsername('user123'), true);
      assert.strictEqual(isValidUsername('test_user'), true);
      assert.strictEqual(isValidUsername('USER'), true);
      assert.strictEqual(isValidUsername('a1b2c3'), true);
    });

    it('should reject invalid usernames', () => {
      assert.strictEqual(isValidUsername('ab'), false, 'Too short');
      assert.strictEqual(isValidUsername('a'.repeat(21)), false, 'Too long');
      assert.strictEqual(isValidUsername('user-name'), false, 'Contains hyphen');
      assert.strictEqual(isValidUsername('user name'), false, 'Contains space');
      assert.strictEqual(isValidUsername('user@name'), false, 'Contains special char');
    });
  });

  describe('Password validation', () => {
    it('should accept valid passwords', () => {
      const result = validatePassword('password123');
      assert.strictEqual(result.valid, true);
    });

    it('should reject short passwords', () => {
      const result = validatePassword('short');
      assert.strictEqual(result.valid, false);
      assert.ok(result.message.includes('8 characters'));
    });

    it('should reject long passwords', () => {
      const result = validatePassword('a'.repeat(129));
      assert.strictEqual(result.valid, false);
      assert.ok(result.message.includes('128 characters'));
    });

    it('should accept passwords at boundary lengths', () => {
      assert.strictEqual(validatePassword('a'.repeat(8)).valid, true);
      assert.strictEqual(validatePassword('a'.repeat(128)).valid, true);
    });
  });
});
