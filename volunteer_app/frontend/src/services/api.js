import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getVolunteers = async () => {
    const response = await axios.get(`${API_URL}/volunteers`);
    return response.data;
};

export const getIncidents = async () => {
    const response = await axios.get(`${API_URL}/incidents`);
    return response.data;
};
