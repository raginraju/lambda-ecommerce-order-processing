echo VITE_COGNITO_USER_POOL_ID=${Token[TOKEN.32]} > frontend/.env
echo VITE_COGNITO_CLIENT_ID=${Token[TOKEN.37]} >> frontend/.env
echo VITE_API_URL=https://${Token[TOKEN.159]}.execute-api.ap-southeast-1.${Token[AWS.URLSuffix.4]}/${Token[TOKEN.164]}/ >> frontend/.env
