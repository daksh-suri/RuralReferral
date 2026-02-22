import api from './axios';

export const hospitalSignup = async (data) => {
    const response = await api.post('/api/hospital/signup', data);
    return response.data;
};

export const hospitalLogin = async (data) => {
    const response = await api.post('/api/hospital/login', data);
    if (response.data.token) {
        localStorage.setItem('hospitalToken', response.data.token);
        localStorage.setItem('hospitalUser', JSON.stringify(response.data.hospital));
    }
    return response.data;
};

export const fetchHospitalResources = async () => {
    const response = await api.get('/api/hospital/resources');
    return response.data;
};

export const updateHospitalResources = async (data) => {
    const response = await api.put('/api/hospital/resources', data);
    return response.data;
};

export const fetchHospitalReferrals = async () => {
    const response = await api.get('/api/hospital/referrals');
    return response.data;
};

export const updateReferralStatus = async (id, status) => {
    const response = await api.patch(`/api/hospital/referrals/${id}`, { status });
    return response.data;
};
