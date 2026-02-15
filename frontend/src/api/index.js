import axios from 'axios';
import { awsConfig } from '../aws-config'; // Import your new config
import Cookies from 'js-cookie';

// --- Auth Client (Cognito) ---
export const authClient = axios.create({
  baseURL: awsConfig.cognitoApiUrl,
  headers: { 'Content-Type': 'application/x-amz-json-1.1' }
});

// --- Order Client (API Gateway) ---
export const apiClient = axios.create({
  baseURL: awsConfig.apiUrl,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor for passing the ID Token
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('idToken');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});