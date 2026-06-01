import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

export const chatWithAI = async (message, mode, conversation_id = null) => {
    const response = await axios.post(`${API_URL}/chat`, { message, mode, conversation_id });
    return response.data;
};

export const getConversations = async () => {
    const response = await axios.get(`${API_URL}/conversations`);
    return response.data;
};

export const getConversation = async (id) => {
    const response = await axios.get(`${API_URL}/conversations/${id}`);
    return response.data;
};

export const deleteConversation = async (id) => {
    const response = await axios.delete(`${API_URL}/conversations/${id}`);
    return response.data;
};

export const saveInsight = async (content) => {
    const response = await axios.post(`${API_URL}/insights`, { content });
    return response.data;
};

export const getInsights = async () => {
    const response = await axios.get(`${API_URL}/insights`);
    return response.data;
};

export const deleteInsight = async (id) => {
    const response = await axios.delete(`${API_URL}/insights/${id}`);
    return response.data;
};

export const getDailyCheck = async () => {
    const response = await axios.get(`${API_URL}/daily-check`);
    return response.data;
};
