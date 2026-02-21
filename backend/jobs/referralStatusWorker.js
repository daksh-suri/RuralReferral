import Referral from '../models/Referral.js';

const DEFAULT_INTERVAL_MS = 2000;

export const processDueReferrals = async (now = new Date()) => {
    const result = await Referral.updateMany(
        {
            status: 'Pending',
            autoAcceptAt: { $lte: now }
        },
        {
            $set: {
                status: 'Accepted',
                acceptedAt: now
            }
        }
    );
 
    return result.modifiedCount || 0;
};

export const startReferralStatusWorker = (intervalMs = DEFAULT_INTERVAL_MS) => {
    const timer = setInterval(async () => {
        try {
            await processDueReferrals();
        } catch (error) {
            console.error('Referral status worker error:', error.message);
        }
    }, intervalMs);

    return () => clearInterval(timer);
};
