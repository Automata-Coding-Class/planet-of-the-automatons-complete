# Planet of the Automatons Cheat Sheet

## Linux
### Process control
- list all running processes `ps -ef -A`
- filter the list of running processes to just Node.js processes: `ps -ef | grep node`
- stop an individual Node.js process: `kill *process_number*`
- stop **all** Node processes: `pkill -f node`

### Permissions
- grant permission for all users to a file `chmod  755 /path/to/yourfile`
- grant permission for all user to all contents of a folder: `chmod  -R 755 /path/to/yourfolder`
