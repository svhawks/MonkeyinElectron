/* imports common modules */

var electron = require('electron')
var ipc = electron.ipcRenderer
var webFrame
var socket = require('socket.io-client')('http://localhost:40000')
