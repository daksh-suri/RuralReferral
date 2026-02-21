import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityIndex, parseVitals } from '../utils/priorityIndex.js';

test('priorityIndex is deterministic', () => {
    const result1 = calculatePriorityIndex({ vitals: 'BP 120/80, HR 88, SpO2 95', age: 70 });
    const result2 = calculatePriorityIndex({ vitals: 'BP 120/80, HR 88, SpO2 95', age: 70 });
    assert.strictEqual(result1.priorityIndex, result2.priorityIndex);
    assert.strictEqual(result1.priorityLevel, result2.priorityLevel);
});

test('priorityIndex maps to HIGH when >= 70', () => {
    const result = calculatePriorityIndex({
        vitals: 'BP 80/50, HR 140, SpO2 85',
        age: 70,
        trauma: true,
        conscious: false,
        symptomSeverity: 9
    });
    assert.ok(result.priorityIndex >= 70);
    assert.strictEqual(result.priorityLevel, 'HIGH');
});

test('priorityIndex maps to MEDIUM when 40-69', () => {
    const result = calculatePriorityIndex({
        vitals: 'BP 120/80, HR 100, SpO2 93',
        age: 70,
        symptomSeverity: 8,
        trauma: true
    });
    assert.ok(result.priorityIndex >= 40 && result.priorityIndex < 70);
    assert.strictEqual(result.priorityLevel, 'MEDIUM');
});

test('priorityIndex maps to LOW when < 40', () => {
    const result = calculatePriorityIndex({
        vitals: 'BP 120/80, HR 75, SpO2 98',
        age: 30,
        trauma: false,
        conscious: true,
        symptomSeverity: 1
    });
    assert.ok(result.priorityIndex < 40);
    assert.strictEqual(result.priorityLevel, 'LOW');
});

test('priorityIndex is capped at 100', () => {
    const result = calculatePriorityIndex({
        vitals: 'BP 60/40, HR 150, SpO2 82',
        age: 80,
        trauma: true,
        conscious: false,
        symptomSeverity: 10
    });
    assert.ok(result.priorityIndex <= 100);
});

test('parseVitals extracts HR, BP, SpO2', () => {
    const parsed = parseVitals('BP 120/80, HR 88, SpO2 95');
    assert.strictEqual(parsed.heartRate, 88);
    assert.strictEqual(parsed.systolicBP, 120);
    assert.strictEqual(parsed.diastolicBP, 80);
    assert.strictEqual(parsed.oxygenLevel, 95);
});

test('urgency influences priority when symptomSeverity not provided', () => {
    const sameVitals = { vitals: 'BP 120/80, HR 80, SpO2 96', age: 50 };
    const low = calculatePriorityIndex({ ...sameVitals, urgency: 'Low' });
    const medium = calculatePriorityIndex({ ...sameVitals, urgency: 'Medium' });
    const high = calculatePriorityIndex({ ...sameVitals, urgency: 'High' });
    assert.ok(low.priorityIndex < medium.priorityIndex, 'Low urgency should score lower than Medium');
    assert.ok(medium.priorityIndex < high.priorityIndex, 'Medium urgency should score lower than High');
});

test('throws when data is null or invalid', () => {
    assert.throws(() => calculatePriorityIndex(null), { message: 'Invalid priority input data' });
    assert.throws(() => calculatePriorityIndex(undefined), { message: 'Invalid priority input data' });
    assert.throws(() => calculatePriorityIndex('invalid'), { message: 'Invalid priority input data' });
});
