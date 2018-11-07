const axios = require('axios');
const authentication = require('../src/authentication');
jest.mock('axios');


describe('Authentication module', () => {
  describe('authenticate', () => {
    const fakeHost = 'fake-host.local',
      fakePort = 2001,
      fakeUsername = 'fnord',
      loginType = 'player';
    const authenticationOptions = {
      serverAddress: fakeHost,
      serverPort: fakePort,
      username: fakeUsername
    };
    test('returns the correct response', () => {
      axios.post.mockResolvedValue({data: {foo: 'bar'}});
      return authentication.authenticate(authenticationOptions).then(result => expect(result).toEqual({foo: 'bar'}));
    })
    test('correctly translates options to URL', () => {
      axios.post.mockResolvedValue({foo: 'bar'});
      authentication.authenticate(authenticationOptions);
      expect(axios.post).toHaveBeenCalledWith(`http://${fakeHost}:${fakePort}/api/authenticate`, {
        loginType: loginType,
        username: fakeUsername
      });
    })
  })
})
