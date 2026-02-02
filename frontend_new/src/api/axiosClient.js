import axios from 'axios';

const cognitoClient = axios.create({
  baseURL: 'https://cognito-idp.ap-southeast-1.amazonaws.com/',
  headers: {
    'Content-Type': 'application/x-amz-json-1.1'
  }
});

export default cognitoClient;