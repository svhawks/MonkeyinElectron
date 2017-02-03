var ipcMain = electron.ipcMain;
var slug = require('slug')
var URL = require('url-parse');
var io = require('socket.io')();
io.on('connection', function(client){});
const parseTampermonkeyScript = require('parse-tampermonkey-script');
// Check url
var E = require("3x3c");

E('./init.sh')
  .then(value => console.log(value))
  .catch(err => console.log(err))

var EDITOR_URL = 'file://' + __dirname + '/pages/editor/index.html';
var LAST_URL = '';

io.on('connection', function(socket){
  ipcMain.on('checkUrl', (event, url) => {

    if (url !== EDITOR_URL) {
      LAST_URL = url;
    }

    find(url)
      .then((site) => {
        // console.log(site);
        readOrigin(site.name)
          .then((script) => {
            url = new URL(url);
            // console.log(site.hash);
            readExecutable(site.hash)
              .then((executable) => {

                event.sender.send('url', {status:true, site, response:{ script, executable }})
                socket.emit('url', {status:true, site, response:{ script, executable }})
              })
              .catch((err) => {
                // console.log(err);
                event.sender.send('url', {status:false});
                socket.emit('url', {status:false});
              })
          })
      })
      .catch((err) => {
        // console.log(err);
        event.sender.send('url', {status:false});
        socket.emit('url', {status:false});
      })
  })

  ipcMain.on('saveScript', (event, script) => {
    console.log('Save script..', script);

    var random = `${Math.floor(Math.random() * (90000000 - 10000000) + 10000000)}.js`;
    parseTampermonkeyScript(script, `${process.env["HOME"]}/.mie/script/${random}`)
      .then((output) => {
        var name = slug(output.name) + '.js';
        var path = `${process.env["HOME"]}/.mie/scripts/${name}`;
        console.log(output);
        var obj = {
          name: name,
          path: path,
          hash: random,
          namespace: output.namespace,
          match: output.match,
          scripts: output.scripts,
          enabled: true,
          remote: false
        }
        insert(obj)
          .then((response) => {
            console.log(response);

            save({name,code:script})
              .then(() => {
                console.log("Script saved..");
              })
              .catch((err) => {
                console.log("Script doesn't saved", err);
              })

          })
      })
  })

});

io.listen(40000);
