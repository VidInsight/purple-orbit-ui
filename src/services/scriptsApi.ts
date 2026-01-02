const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

export interface Script {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  file_size: number;
  required_packages: string[];
  tags: string[];
  created_at: string;
}

export interface ScriptsApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    scripts: Script[];
    count: number;
  };
}

/**
 * Get all scripts
 */
export const getScripts = async (): Promise<ScriptsApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/admin/scripts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(errorData.message || errorData.error || `Failed to fetch scripts: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

