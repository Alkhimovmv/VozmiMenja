export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getStatusText = (status: string): string => {
  const statusMap = {
    pending: 'Ожидает',
    active: 'Активна',
    completed: 'Завершена',
    overdue: 'Просрочена',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap = {
    pending: 'bg-blue-300 border-blue-400',
    active: 'bg-green-300 border-green-400',
    completed: 'bg-gray-300 border-gray-400',
    overdue: 'bg-red-300 border-red-400',
  };
  return colorMap[status as keyof typeof colorMap] || 'bg-blue-300 border-blue-400';
};

export const getSourceText = (source: string): string => {
  const sourceMap = {
    avito: 'Авито',
    website: 'Сайт',
    referral: 'Рекомендация',
    maps: 'Карты',
  };
  return sourceMap[source as keyof typeof sourceMap] || source;
};