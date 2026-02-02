// src/aws-config.js
export const awsConfig = {
    // Auth (Cognito)
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    
    // API (Gateway)
    apiGatewayUrl: import.meta.env.VITE_API_URL
};