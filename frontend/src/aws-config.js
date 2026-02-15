const getEnv = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        // This will show up in your browser console and stop the app from running blindly
        console.error(`❌ Missing Environment Variable: ${key}`);
    }
    return value;
};

export const awsConfig = {
    // Auth
    region: getEnv('VITE_COGNITO_REGION') || 'ap-southeast-1',
    userPoolId: getEnv('VITE_COGNITO_USER_POOL_ID'),
    userPoolWebClientId: getEnv('VITE_COGNITO_CLIENT_ID'),
    cognitoApiUrl: getEnv('VITE_COGNITO_API_URL'),
    
    // API
    apiUrl: getEnv('VITE_API_URL'),

    // CDN
    cdnUrl: getEnv('VITE_CDN_URL')
};

// Fail-Safe: Check if critical values are missing and alert the developer
const criticalKeys = ['userPoolId', 'apiUrl'];
criticalKeys.forEach(key => {
    if (!awsConfig[key]) {
        throw new Error(`CRITICAL CONFIG MISSING: ${key}. Check your .env.local or GitHub Actions!`);
    }
});