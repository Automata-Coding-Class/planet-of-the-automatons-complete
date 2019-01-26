This approach to implementing game rules seems over-engineered at the moment, but it's because this
is a preparatory step to allowing class participants to code a rules engine for the game as well as 
a client 'bot'.

This is also the reason why:
- the socket connection approach is different here than in the rest of the server (it's socket.io 
client- rather than server-based)
- the code here is not DRY vis-à-vis the cli-client code, since both of these are intended to be
separately cloneable submodules (the cli-client already is) or the template for such… this 'game'
directory is intended to serve that purpose. It will, however, likely remain here, since a default
rules engine will always be required as part of the server, and it in any case makes sense to use
the same architecture and pattern to connect to the local rules engine as we would use to connect to
a remote one. 
