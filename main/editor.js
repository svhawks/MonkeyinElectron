const ipcMain = electron.ipcMain
const slug = require('slug')
const URL = require('url-parse')
const urlSteroids = require('url-steroids');

const parseTampermonkeyScript = require('parse-tampermonkey-script')

const EDITOR_URL = 'file://' + __dirname + '/pages/editor/index.html'
let LAST_URL = ''
let LAST_OBJ = {};

ipcMain.on('editorLoad', (event, arg) => {
  var response = LAST_OBJ;
  event.sender.send('editor', response);
})

ipcMain.on('checkUrl', (event, arg) => {
  var url = arg.url;
    LAST_URL = url;
    async.waterfall([
     (callback) => {
         find(url)
           .then(site => callback(null, site))
           .catch(err => callback(err, null))
     },
     ],  (err, response) => {
       if (err) {
        //  console.log(err);
         if (url.length > 0 && url !== EDITOR_URL) {
           urlSteroids.parse(url)
            .then((out) => {
              LAST_OBJ = {
                status: false,
                url: url,
                details: out,
                id: arg.id
              }
             })
             .catch((err) => {
               console.log("Url steroids error ",err);
             })
         }
      } else {
        event.sender.send('url', {status:true, response:response, id:arg.id});
        LAST_OBJ = {
          status: true,
          response: response,
          url: url,
          id: arg.id
        }
      }
    });
});

ipcMain.on('saveScript', (event, script) => {
    parseTampermonkeyScript(script)
      .then((output) => {
          var name = Math.floor(Math.random() * (10000000000 - 1) + 1) + '.js';
          output.name = name;
          var obj = output
          async.parallel([ // TODO REMOVE SCRIPTS PUBLISH SCRIPT BUTTON.
              (callback) => {
                save({name,code:script})
                  .then(() => callback(null, "Script saved"))
                  .catch((err) => callback(err, null))
              },
              (callback) => {
                insert(obj)
                  .then(response => callback(null, response))
                  .catch(err => callback(err, null))
              }
          ], (err, results) => {
              if (err) {
                console.log(err);
                notifier.notify({
                  'title': 'Monkey in Electron!',
                  'message': JSON.stringify(err)
                })
              } else {
                console.log(results);
              }
          })
      })
  })
