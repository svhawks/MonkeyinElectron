// This module for read config.json.
var E = require('3x3c');
var async = require('async');

var PATH = `${__dirname}/ext/mie/config.json`;
const notifier = require('node-notifier');
var slug = require('slug')

function insert(obj) {
  return new Promise(function(resolve, reject) {
    fs.readFile(PATH, 'utf8', function(err, data) { // read file to memory
      if (!err) {
          try {
            data = JSON.parse(data);
            data.sites.forEach((site, key) => {
              if (site.name === obj.name && site.enabled && site.hash != obj.hash) {
                // reject('Name is already declared');
                notifier.notify({
                  'title': 'Monkey in Electron!',
                  'message': 'Override old version.'
                });
                site.enabled = false;
              }
            })
            data.sites.push(obj);
            console.log(data);
            fs.writeFile(PATH, JSON.stringify(data), function(err) { // write file
                if (err) { // if error, report
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
  //name, code
  return new Promise(function(resolve, reject) {
    var SAVEPATH = `${__dirname}/ext/mie/scripts/${obj.name}`;

    fs.writeFile(SAVEPATH, obj.code, function(err) { // write file
        if (err) { // if error, report
            notifier.notify({
              'title': 'Monkey in Electron!',
              'message': 'Script doesn\'t saved :(..'
            });
            reject (err);
        }
        notifier.notify({
          'title': 'Monkey in Electron!',
          'message': 'Script saved..'
        });
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
          if (site.match === url && site.enabled) {
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

function readExecutable(hash) {
  console.log("Okumaya geldi", hash);
  return new Promise(function(resolve, reject) {
    var HASHPATH = `${__dirname}/ext/mie/script/${hash}`;

    fs.readFile(HASHPATH, 'utf8', function(err, data) { // read file to memory
      if (err) {
        reject(err);
      }
      resolve(data)
    });
  });
}


function readOrigin (name) {
  return new Promise(function(resolve, reject) {
    var SAVEPATH = `${__dirname}/ext/mie/scripts/${name}`;
    fs.readFile(SAVEPATH, 'utf8', function(err, data) { // read file to memory
      if (err) {
        reject(err);
      }
      resolve(data)
    });
  });
}
