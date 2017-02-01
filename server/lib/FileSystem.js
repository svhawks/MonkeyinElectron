// This module for read config.json.
var E = require('3x3c');
var async = require('async');
var fs = require('fs');
var PATH = `${process.env['HOME']}/.mie/config.json`;
const notifier = require('node-notifier');
var slug = require('slug')

module.exports.insert = function (obj) {
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

module.exports.delete = function (name) {
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

module.exports.list = function (name) {
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

module.exports.save = function (obj) {
  //name, code
  return new Promise(function(resolve, reject) {
    var SAVEPATH = `${process.env['HOME']}/.mie/scripts/${obj.name}`;

    fs.writeFile(SAVEPATH, obj.code, function(err) { // write file
        if (err) { // if error, report
            reject (err);
        }
        resolve('Config updated.');
    });
  });
}

module.exports.find = function (url) {
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

module.exports.read = function (hash) {
  return new Promise(function(resolve, reject) {
    var HASHPATH = `./public/script/${hash}`;
    console.log(HASHPATH);
    fs.readFile(HASHPATH, 'utf8', function(err, data) { // read file to memory
      if (err) {
        reject(err);
      }
      resolve(data)
    });
  });
}


module.exports.readOrigin = function (name) {
  return new Promise(function(resolve, reject) {
    var SAVEPATH = `${process.env['HOME']}/.mie/scripts/${name}`;
    fs.readFile(SAVEPATH, 'utf8', function(err, data) { // read file to memory
      if (err) {
        reject(err);
      }
      resolve(data)
    });
  });
}
