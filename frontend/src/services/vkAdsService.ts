// Сервис для работы с VK Ads
import axios from 'axios';
import { API_BASE_URL } from '../config';

export async function fetchVKCampaigns() {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${API_BASE_URL}/api/auth/vk_ads/campaigns`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.campaigns;
} 