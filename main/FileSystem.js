// This module for read config.json.
var async = require('async');
var bugsnag = require("bugsnag");
bugsnag.register("23bbc0b43951a81209436f177df8f52f");
var PATH = `${process.env["HOME"]}/.mie/config.json`;
const notifier = require('node-notifier');
const mkdirp = require('mkdirp');
const exist = require('3x1st');
// const urlSteroids = require('url-steroids');
run();
function insert(obj) {
  return new Promise((resolve, reject) => {
    fs.readFile(PATH, 'utf8', (err, data) => {
      if (!err) {
          try {
            data = JSON.parse(data);
            console.log(data);
            data.sites.forEach((site, key) => {
              if (site.name === obj.name || site.match === obj.match) {
                const bothEnabled = site.enabled && obj.enabled;
                const bothDisabled = !site.enabled && !obj.enabled;
                if (!bothEnabled || !bothDisabled) {
                  site.enabled = obj.enabled;
                  const message = `Script ${obj.enabled ? 'enabled': 'disabled'}`
                  delete data.sites[key];
                  data.sites = data.sites.filter(n => true)
                } else {
                  reject("Nothing to do.")
                }

              }
            })
            data.sites.push(obj);

            fs.writeFile(PATH, JSON.stringify(data), (err) => {
                if (err) {
                    bugsnag.notify(new Error(err));
                    reject (err);
                }
                resolve('Config updated.');
            });
          } catch (e) {
            bugsnag.notify(new Error(e));
            reject(e);
          }
      } else {
        bugsnag.notify(new Error(err));
        reject(err);
      }
    });
  });
}

function deleteScript(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(PATH, 'utf8', (err, data) => {
      if (!err) {
          try {
            data = JSON.parse(data.toString());
            data.sites.forEach((site, key) => {
              if (site.name === name) {
                delete data.sites[key];
                fs.unlinkSync(site.path);
                data.sites = data.sites.filter(n => true)
                fs.writeFile(PATH, JSON.stringify(data), (err) => {
                    if (err) {
                        bugsnag.notify(new Error(err));
                        reject (err);
                    }
                    resolve('Data removed from config.');
                });
              }
            })

          } catch (e) {
            bugsnag.notify(new Error(e));
            reject(e);
          }

      } else {
        bugsnag.notify(new Error(err));
        reject(err);
      }
    });
  });
}

function list(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(PATH, 'utf8', (err, data) => {
      if (!err) {
          try {
            data = JSON.parse(data.toString());
            resolve(data);
          } catch (e) {
            bugsnag.notify(new Error(e));
            reject(e);
          }

      } else {
        bugsnag.notify(new Error(err));
        reject(err);
      }
    });
  });
}

function save(obj) {
  return new Promise((resolve, reject) => {
    var SAVEPATH = `${process.env["HOME"]}/.mie/scripts/${obj.name}`;

    fs.writeFile(SAVEPATH, obj.code, (err) => {
        if (err) {
            notifier.notify({
              'title': 'Monkey in Electron!',
              'message': `Error: ${err}`
            });
            bugsnag.notify(new Error(err));
            reject (err);
        }
        resolve('Script saved..');
    });
  });
}

function match(data, url) {
  return new Promise((resolve, reject) => {
    data = JSON.parse(data.toString());
    data.sites.forEach((site, key) => {
      urlSteroids.match(site.match, url)
        .then(() => {
          resolve(site)
        })
    })
  });
}

function find(url) {
  return new Promise((resolve, reject) => {
    fs.readFile(PATH, 'utf8', (err, data) => {
      if (err) {
        bugsnag.notify(new Error(err));
        reject(err);
      }
      match(data, url)
        .then(site => resolve(site))
      setTimeout(function () {
        reject("Site not found.")
      }, 2000);
    });
  });
}

function readOrigin (name) {
  return new Promise((resolve, reject) => {
    var SAVEPATH = `${process.env["HOME"]}/.mie/scripts/${name}`;
    fs.readFile(SAVEPATH, 'utf8', (err, data) => {
      if (err) {
        bugsnag.notify(new Error(err));
        reject(err);
      }
      resolve(data)
    });
  });
}
