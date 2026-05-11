// In development, we use the Vite proxy (defined in vite.config.js)
// In production, we use the absolute URL of the Elastic Beanstalk backend
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://student-mgmt-env.eba-rpm2e4pb.us-east-1.elasticbeanstalk.com' 
  : '';

export default API_BASE_URL;
