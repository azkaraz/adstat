import React, { useEffect, useState } from 'react';
import { fetchVKCampaigns } from '../services/vkAdsService';

const fields = [
  { key: 'name', label: 'Название кампании' },
  { key: 'created', label: 'Дата добавления' },
  { key: 'report_from', label: 'Отчет от' },
  { key: 'report_to', label: 'Отчет до' },
  { key: 'impressions', label: 'Просмотры' },
  { key: 'clicks', label: 'Клики' },
  { key: 'subscribers', label: 'Подписчики' },
  { key: 'spent', label: 'Затраты' },
  { key: 'cpc', label: 'CPC' },
  { key: 'ctr', label: 'CTR' },
];

export default function VKCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVKCampaigns()
      .then(setCampaigns)
      .catch(e => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{color: 'red'}}>Ошибка: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Рекламные кампании VK</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              {fields.map(f => (
                <th key={f.key} className="px-2 py-1 border-b bg-gray-100">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr><td colSpan={fields.length} className="text-center py-4">Нет данных</td></tr>
            )}
            {campaigns.map((c, idx) => (
              <tr key={c.id || idx}>
                {fields.map(f => (
                  <td key={f.key} className="px-2 py-1 border-b text-center">{c[f.key] ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 