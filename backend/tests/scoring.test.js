import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReferralScore } from '../utils/referralScoring.js';

test('score stays in 0..100 bounds', () => {
    const score = calculateReferralScore({
        travelTime: 999,
        availableCapacity: 0,
        totalCapacity: 50,
        loadFactor: 1.5,
        urgency: 'Low'
    });

    assert.ok(score >= 0 && score <= 100);
});

test('higher urgency gives higher score with same hospital data', () => {
    const shared = {
        travelTime: 25,
        availableCapacity: 10,
        totalCapacity: 50,
        loadFactor: 0.6
    };
    const high = calculateReferralScore({ ...shared, urgency: 'High' });
    const medium = calculateReferralScore({ ...shared, urgency: 'Medium' });
    const low = calculateReferralScore({ ...shared, urgency: 'Low' });

    assert.ok(high > medium);
    assert.ok(medium > low);
});

test('shorter travel time improves score when other factors are equal', () => {
    const shared = {
        availableCapacity: 8,
        totalCapacity: 20,
        loadFactor: 0.5,
        urgency: 'High'
    };
    const near = calculateReferralScore({ ...shared, travelTime: 15 });
    const far = calculateReferralScore({ ...shared, travelTime: 60 });

    assert.ok(near > far);
});
