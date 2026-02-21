import { generateClinicalInsight as localGenerateInsight } from './triageAI.js';

export const generateClinicalInsight = async (data) => {
    const { patientAge, symptoms, bp, hr, spo2, urgency } = data;
    const apiKey = import.meta.env.VITE_MEGALLM_API_KEY;

    if (!apiKey) {
        console.warn('MegaLLM API key not found. Falling back to local triageAI.');
        const fallback = localGenerateInsight(data);
        return fallback.text;
    }

    const prompt = `You are a rural emergency triage assistant.
Given patient vitals and symptoms, provide: 

Clinical concern
Severity level
Referral justification

Patient:
Age: ${patientAge}
Symptoms: ${symptoms}
BP: ${bp}
HR: ${hr}
SpO2: ${spo2}
Urgency: ${urgency}

Respond in 2–3 sentences.`;

    try {
        const response = await fetch('https://api.megallm.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mega-llm-1', // Placeholder model name
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error(`MegaLLM API returned status ${response.status}`);
        }

        const result = await response.json();

        if (result.choices && result.choices.length > 0 && result.choices[0].message) {
            return result.choices[0].message.content.trim();
        } else if (result.text) {
            return result.text.trim();
        }

        throw new Error('Invalid response structure from MegaLLM');
    } catch (error) {
        console.warn('MegaLLM API request failed. Falling back to local triageAI.', error);
        const fallback = localGenerateInsight(data);
        return fallback.text;
    }
};
