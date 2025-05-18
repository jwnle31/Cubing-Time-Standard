import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UpdateTime {
  UPDATE_TIME: string;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/stats/updatetime`;

const fetchUpdateTime = async (): Promise<UpdateTime[]> => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const useFetchUpdateTime = () => {
  return useQuery<UpdateTime[], Error>({
    queryKey: ['update-time'],
    queryFn: fetchUpdateTime,
  });
};
