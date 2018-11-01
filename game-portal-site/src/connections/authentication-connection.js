import axios from 'axios';

export function authenticateUser(loginType, username, password) {
  console.log(`authenticate: loginType='${loginType}'; username='${username}'; password='${password}'`);
  return axios.post('http://localhost:3000/api/authenticate', {
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
