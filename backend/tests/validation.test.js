import test from 'node:test';
import assert from 'node:assert/strict';
import { validationResult } from 'express-validator';
import { validateSignup, validateLogin } from '../routes/auth.js';
import { validateReferral } from '../routes/referrals.js';

const firstValidationError = async (validators, body) => {
    const req = { body };
    for (const validator of validators) {
        await validator.run(req);
    }
    const result = validationResult(req);
    return result.isEmpty() ? null : result.array()[0].msg;
};
 
test('signup validation fails when required profile fields are missing', async () => {
    const message = await firstValidationError(validateSignup, {
        contact: '1234567890',
        password: 'password123'
    });

    assert.equal(message, 'Name is required');
});

test('login validation fails when password is missing', async () => {
    const message = await firstValidationError(validateLogin, {
        contact: '1234567890'
    });

    assert.equal(message, 'Password is required');
});
  
test('referral validation rejects out-of-range patient age', async () => {
    const message = await firstValidationError(validateReferral, {
        patientAge: 121,
        urgency: 'High',
        symptoms: 'Chest pain',
        vitals: 'BP 150/90'
    });

    assert.equal(message, 'patientAge must be an integer between 0 and 120');
});

test('referral validation accepts valid payload', async () => {
    const message = await firstValidationError(validateReferral, {
        patientAge: 45,
        urgency: 'Medium',
        symptoms: 'Fever and dizziness',
        vitals: 'BP 120/80, HR 88'
    });

    assert.equal(message, null);
});
