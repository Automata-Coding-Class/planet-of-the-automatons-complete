import axios from 'axios';
import router from '../router';

const vueAppApiUrl = process.env.VUE_APP_API_URL !== undefined ? process.env.VUE_APP_API_URL : "http://localhost:3000/api";

export function authenticateUser(loginType, username, password) {
  console.log(`authenticate: loginType='${loginType}'; username='${username}'; password='${password}'`);
  return axios.post(`${vueAppApiUrl}/authenticate`, {
    loginType: loginType,
    username: username,
    password: password
  })
    .then(response => {
        console.log(`authentication.authenticate response:`, response);
        return response.data;
      },
      err => {
        return err.response.data;
      });
}
