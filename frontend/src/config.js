// In development, we use the Vite proxy (defined in vite.config.js)
// In production, we use the CloudFront HTTPS wrapper for our EB backend
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://d335ezydcfytbv.cloudfront.net' 
  : '';

export default API_BASE_URL;
