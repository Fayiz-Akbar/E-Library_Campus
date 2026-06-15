// src/api/dashboardApi.js
import axiosInstance from './axiosInstance';

export const fetchAdminDashboard = async () => {
  const response = await axiosInstance.get('/dashboard/admin');
  return response.data;
};
