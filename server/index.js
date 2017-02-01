const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const parse = require('parse-tampermonkey-script');
const E = require('3x3c');
const fileSystem = require('./lib/FileSystem');
const notifier = require('node-notifier');
const async = require('async');
var slug = require('slug')

var URL = require('url-parse');

notifier.notify({
  'title': 'Monkey in Electron!',
  'message': 'Yaay! Hello world!'
});
app.use('/public', express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/list', (req, res) => {
  fileSystem.list()
    .then((response) => {
      res.json(response);
    })
});

// TODO @cagatay slug names.
// app.get('/delete/:name', (req, res) => {
//   fileSystem.delete(req.query.name)
//     .then((response) => {
//       res.json(response);
//     })
// });

io.on('connection', (socket) => {
  socket.on('saveScript', (script) => {
    // console.log(script);
    var random = `${Math.floor(Math.random() * (90000000 - 10000000) + 10000000)}.js`;


    parse(script, `./public/script/${random}`)
    // parse(script, `${process.env['HOME']}/.mie/scripts/${random}`)
      .then((output) => {
        var name = slug(output.name) + '.js';
        var path = `${process.env['HOME']}/.mie/scripts/${name}`;
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
        fileSystem.insert(obj)
          .then((response) => {
            console.log(response);

            fileSystem.save({name,code:script})
              .then(() => {
                notifier.notify({
                  'title': 'Monkey in Electron!',
                  'message': 'Your script saved!'
                });
              })
              .catch((err) => {
                notifier.notify({
                  'title': 'Monkey in Electron!',
                  'message': `Err: ${err}`
                });
              })

          })
      })
  });

  socket.on('checkUrl', (url) => {
    console.log(url);

    fileSystem.find(url)
      .then((site) => {
        // console.log(site);
        var scriptUrl;
        if (!site.remote) {
          scriptUrl = `http://localhost:9090/public/script/${site.hash}`
        } else {
          scriptUrl = site.path;
        }

        fileSystem.readOrigin(site.name)
          .then((script) => {
            url = new URL(url);
            console.log(script);
            fileSystem.read(site.hash)
              .then((executable) => {
                io.emit('url', {status:true, site, response:{url, scriptUrl, script:script, executable }})
              })
          })
      })
      .catch((err) => {
        // console.log('site not found');
        io.emit('url', {status:false})
      })
  })
});


http.listen(process.env.PORT || 9090, () => {
  console.log('listening on *:9090');
});
