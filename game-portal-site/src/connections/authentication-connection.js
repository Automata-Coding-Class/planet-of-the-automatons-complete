import axios from 'axios';
import router from '../router';

export function authenticateUser(loginType, username, password) {
  console.log(`authenticate: loginType='${loginType}'; username='${username}'; password='${password}'`);
  return axios.post(`${process.env.VUE_APP_API_URL}/authenticate`, {
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
