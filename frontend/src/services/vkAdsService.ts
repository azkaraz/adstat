// Сервис для работы с VK Ads
import axios from 'axios';

export async function fetchVKCampaigns() {
  const response = await axios.get('/api/vk_ads/campaigns');
  return response.data.campaigns;
} 