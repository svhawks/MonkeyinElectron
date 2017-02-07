// This module for read config.json.
var async = require('async');

var PATH = `${process.env["HOME"]}/.mie/config.json`;
const notifier = require('node-notifier');

function insert(obj) {
  return new Promise(function(resolve, reject) {
    fs.readFile(PATH, 'utf8', function(err, data) { // read file to memory
      if (!err) {
          try {
            data = JSON.parse(data);
            console.log(data);
            data.sites.forEach((site, key) => {
              if (site.name === obj.name) {
                const bothEnabled = site.enabled && obj.enabled;
                const bothDisabled = !site.enabled && !obj.enabled;
                if (!bothEnabled || !bothDisabled) {
                  site.enabled = obj.enabled;
                  const message = `Script ${obj.enabled ? 'enabled': 'disabled'}`
                  delete data.sites[key];
                  data.sites = data.sites.filter(n => true)
                  notifier.notify({
                    'title': 'Monkey in Electron!',
                    'message': message
                  });
                } else {
                  reject("Nothing to do.")
                }

              }
            })
            data.sites.push(obj);

            fs.writeFile(PATH, JSON.stringify(data), function(err) {
                if (err) {
                    reject (err);
                }
                resolve('Config updated.');
            });
          } catch (e) {
            reject(e);
          }
      } else {
        reject(err);
      }
    });
  });
}

function deleteScript(name) {
  return new Promise(function(resolve, reject) {
    fs.readFile(PATH, 'utf8', function(err, data) { // read file to memory
      if (!err) {
          try {
            data = JSON.parse(data.toString());
            data.sites.forEach((site, key) => {
              if (site.name === name) {
                delete data.sites[key];
                fs.unlinkSync(site.path);
                data.sites = data.sites.filter(n => true)
                fs.writeFile(PATH, JSON.stringify(data), function(err) { // write file
                    if (err) { // if error, report
                        reject (err);
                    }
                    resolve('Data removed from config.');
                });
              }
            })

          } catch (e) {
            reject(e);
          }

      } else {
        reject(err);
      }
    });
  });
}

function list(name) {
  return new Promise(function(resolve, reject) {
    fs.readFile(PATH, 'utf8', function(err, data) { // read file to memory
      if (!err) {
          try {
            data = JSON.parse(data.toString());
            resolve(data);
          } catch (e) {
            reject(e);
          }

      } else {
        reject(err);
      }
    });
  });
}

function save(obj) {
  return new Promise(function(resolve, reject) {
    var SAVEPATH = `${process.env["HOME"]}/.mie/scripts/${obj.name}`;

    fs.writeFile(SAVEPATH, obj.code, function(err) {
        if (err) {
            notifier.notify({
              'title': 'Monkey in Electron!',
              'message': 'Script doesn\'t saved :(..'
            });
            reject (err);
        }
        resolve('Script saved..');
    });
  });
}

function find(url) {
  return new Promise(function(resolve, reject) {
    fs.readFile(PATH, 'utf8', function(err, data) { // read file to memory
      if (err) {
        reject(err);
      }
      try {
        data = JSON.parse(data.toString());
        data.sites.forEach((site, key) => {
          if (site.match === url) {
            resolve(site)
          }
        })
        reject('site not found'); // @TODO @cagatay IF WANT DONT DELETE UN SAVED THINGS..
      } catch (e) {
        reject('site not found');
      }
    });
  });
}

function readOrigin (name) {
  return new Promise(function(resolve, reject) {
    var SAVEPATH = `${process.env["HOME"]}/.mie/scripts/${name}`;
    fs.readFile(SAVEPATH, 'utf8', function(err, data) { // read file to memory
      if (err) {
        reject(err);
      }
      resolve(data)
    });
  });
}
