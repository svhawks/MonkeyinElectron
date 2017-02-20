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
  if (url === LAST_URL) {
    console.log("Loaded url:", url);
  } else {
    LAST_URL = url;
    async.waterfall([
     (callback) => {
         find(url)
           .then(site => callback(null, site))
           .catch(err => callback(err, null))
     },
     (site, callback) => {
         readOrigin(site.name).then(script => callback(null, script))
     },
     (originalScript, callback) => {
         parseTampermonkeyScript(originalScript)
           .then(executable => {
             const response = {
               script: originalScript,
               executable
             }
             callback(null, response);
         })
     }
     ],  (err, response) => {
       if (err) {
         console.log(err);
         if (url.length > 0 && url !== EDITOR_URL) {
           urlSteroids.parse(url)
            .then((out) => {
              LAST_OBJ = {
                status: false,
                url: url,
                details: out
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
          url: url
        }
      }
     });
  }

});

ipcMain.on('saveScript', (event, script) => {
    parseTampermonkeyScript(script)
      .then((output) => {
          const name = slug(output.name) + '.js'
          const obj = {
            name,
            match: output.match,
            scripts: output.scripts,
            enabled: output.enabled
          }
          async.parallel([
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
                notifier.notify({
                  'title': 'Monkey in Electron!',
                  'message': JSON.stringify(err)
                })
              }
              console.log(results)
          })
      })
  })
