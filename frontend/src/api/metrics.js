import api from './axios';

export const getRoutingMetrics = async () => {
    const response = await api.get('/routing-metrics');
    return response.data;
};
