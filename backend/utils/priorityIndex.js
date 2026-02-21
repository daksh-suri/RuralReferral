/**
 * Priority Index: Medically consistent, deterministic classification layer.
 * Does NOT use travel time, hospital capacity, or routing metrics.
 * Reflects patient condition only.
 *
 * Output: priorityIndex (0–100), priorityLevel (HIGH | MEDIUM | LOW)
 */

/**
 * Parses vitals string (e.g. "BP 120/80, HR 88, SpO2 95") into structured values.
 * @returns {{ heartRate: number|null, systolicBP: number|null, diastolicBP: number|null, oxygenLevel: number|null }}
 */
export function parseVitals(vitalsStr) {
    const result = { heartRate: null, systolicBP: null, diastolicBP: null, oxygenLevel: null };
    if (!vitalsStr || typeof vitalsStr !== 'string') return result;

    const s = vitalsStr;

    // HR / Heart Rate: "HR 88", "heart rate 88"
    const hrMatch = s.match(/\bHR\s*[:=]?\s*(\d+)/i) || s.match(/\bheart\s*rate\s*[:=]?\s*(\d+)/i);
    if (hrMatch) result.heartRate = parseInt(hrMatch[1], 10);

    // BP: "120/80", "BP 120/80", "BP 120"
    const bpMatch = s.match(/\bBP\s*[:=]?\s*(\d+)(?:\s*[\/]\s*(\d+))?/i) || s.match(/(\d+)\s*[\/]\s*(\d+)/);
    if (bpMatch) {
        result.systolicBP = parseInt(bpMatch[1], 10);
        result.diastolicBP = bpMatch[2] ? parseInt(bpMatch[2], 10) : null;
    }

    // SpO2 / Oxygen: "SpO2 95", "SpO2: 95", "oxygen 95"
    const o2Match = s.match(/SpO2\s*[:=]?\s*(\d+)/i) || s.match(/\boxygen\s*[:=]?\s*(\d+)/i);
    if (o2Match) result.oxygenLevel = parseInt(o2Match[1], 10);

    return result;
}

/**
 * Computes whether vitals indicate severe instability.
 * Based on: hypotension, hypertensive crisis, bradycardia, tachycardia, hypoxia.
 */
function hasSevereVitalInstability({ heartRate, systolicBP, diastolicBP, oxygenLevel }) {
    if (heartRate !== null) {
        if (heartRate < 40 || heartRate > 130) return true;
    }
    if (systolicBP !== null) {
        if (systolicBP < 90 || systolicBP >= 180) return true;
    }
    if (diastolicBP !== null && diastolicBP >= 120) return true;
    if (oxygenLevel !== null && oxygenLevel < 90) return true;
    return false;
}

/**
 * Computes whether there is any vital instability (milder than severe).
 */
function hasVitalInstability({ heartRate, systolicBP, diastolicBP, oxygenLevel }) {
    if (heartRate !== null && (heartRate < 50 || heartRate > 120)) return true;
    if (systolicBP !== null && (systolicBP < 100 || systolicBP > 160)) return true;
    if (oxygenLevel !== null && oxygenLevel < 95) return true;
    return false;
}

/**
 * Strict numeric conversion. Returns null if value is missing or converts to NaN.
 */
function toStrictNumber(value) {
    if (value == null || value === '') return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
}

/**
 * Calculates a numeric priority index (0–100) from medically relevant inputs.
 * Deterministic, no random numbers. Purely data-driven; no silent mid-range defaults.
 *
 * @param {Object} data
 * @param {string} [data.vitals] - Vitals string to parse (e.g. "BP 120/80, HR 88, SpO2 95")
 * @param {number} [data.heartRate]
 * @param {number} [data.systolicBP]
 * @param {number} [data.oxygenLevel]
 * @param {number} [data.symptomSeverity] - 1–10 scale (explicit override when provided)
 * @param {string} [data.urgency] - Provider urgency (High/Medium/Low) — used to derive symptomSeverity when not provided
 * @param {boolean} [data.trauma] - Trauma case flag (default false)
 * @param {number} [data.age] - Patient age
 * @param {boolean} [data.conscious] - Conscious status (default true)
 * @returns {{ priorityIndex: number, priorityLevel: 'HIGH'|'MEDIUM'|'LOW' }}
 */
export function calculatePriorityIndex(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid priority input data');
    }

    let parsed = {};
    if (data.vitals) {
        parsed = parseVitals(data.vitals);
    }

    const rawHeartRate = data.heartRate ?? parsed.heartRate;
    const rawSystolicBP = data.systolicBP ?? parsed.systolicBP;
    const rawOxygenLevel = data.oxygenLevel ?? parsed.oxygenLevel;

    const heartRate = toStrictNumber(rawHeartRate);
    const systolicBP = toStrictNumber(rawSystolicBP);
    const diastolicBP = toStrictNumber(parsed.diastolicBP);
    const oxygenLevel = toStrictNumber(rawOxygenLevel);
    const age = toStrictNumber(data.age);

    let symptomSeverity;
    if (data.symptomSeverity != null) {
        symptomSeverity = Math.max(1, Math.min(10, Number(data.symptomSeverity)));
    } else if (data.urgency === 'High') {
        symptomSeverity = 8;
    } else if (data.urgency === 'Low') {
        symptomSeverity = 2;
    } else {
        symptomSeverity = 5;
    }

    if (isNaN(symptomSeverity) || symptomSeverity < 1 || symptomSeverity > 10) {
        throw new Error('symptomSeverity must be a valid number between 1 and 10');
    }

    const trauma = Boolean(data.trauma);
    const conscious = data.conscious !== false;

    const vitals = { heartRate, systolicBP, diastolicBP, oxygenLevel };

    let computedScore = 0;

    // Severe vital instability → +40
    if (hasSevereVitalInstability(vitals)) {
        computedScore += 40;
    }

    // Oxygen < 90% → +30
    if (oxygenLevel !== null && oxygenLevel < 90) {
        computedScore += 30;
    }

    // Unconscious → +25
    if (!conscious) {
        computedScore += 25;
    }

    // Trauma case → +20
    if (trauma) {
        computedScore += 20;
    }

    // Severity scale weight → severity * 3 (max +30)
    computedScore += symptomSeverity * 3;

    // Age > 65 with instability → +10
    const instability = hasVitalInstability(vitals) || hasSevereVitalInstability(vitals);
    if (age !== null && age > 65 && instability) {
        computedScore += 10;
    }

    const priorityIndex = Math.min(100, Math.max(0, Math.round(computedScore)));

    let priorityLevel;
    if (priorityIndex >= 70) priorityLevel = 'HIGH';
    else if (priorityIndex >= 40) priorityLevel = 'MEDIUM';
    else priorityLevel = 'LOW';

    // Temporary debug log to confirm no constant overwriting
    console.log({
        heartRate,
        systolicBP,
        oxygenLevel,
        symptomSeverity,
        urgency: data.urgency,
        trauma,
        conscious,
        computedScore,
        priorityIndex
    });

    return { priorityIndex, priorityLevel };
}
