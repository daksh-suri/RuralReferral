import api from './axios';

export const computeReferral = async (referralData) => {
    const response = await api.post('/api/referrals/compute', referralData);
    return response.data;
};

export const createReferral = async (referralData) => {
    const response = await api.post('/api/referrals', referralData);
    return response.data;
};

export const getReferrals = async () => {
    const response = await api.get('/api/referrals');
    return response.data;
};
