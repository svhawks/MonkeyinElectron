const ipcMain = electron.ipcMain
const slug = require('slug')
const URL = require('url-parse')
const io = require('socket.io')()
io.on('connection', client => {})
const parseTampermonkeyScript = require('parse-tampermonkey-script')

const EDITOR_URL = 'file://' + __dirname + '/pages/editor/index.html'
let LAST_URL = ''

io.on('connection', (socket) => {
  ipcMain.on('switchToWebview', (event, url) => {
    LAST_URL = '';
  })
  ipcMain.on('checkUrl', (event, url) => {
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
          parseTampermonkeyScript(originalScript).then(executable => {
            const response = {
              script: originalScript,
              executable
            }
            callback(null, response);
          })
      }
    ],  (err, response) => {
        if (err) {
          event.sender.send('url', {status:false, err})
        }
        if (LAST_URL !== url && url !== EDITOR_URL) {
          LAST_URL = url
          event.sender.send('url', {status:true, response})
        } else {
          socket.emit('url', {status:true, response})
        }
      });

  })

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
})


try {
  io.listen(40000)
} catch (e) {
  console.log(e)
}


process.on('uncaughtException', (err) => {
  console.log(err)
})
