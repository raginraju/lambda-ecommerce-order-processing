import { apiClient } from '@/api';

export const fetchUserOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};
