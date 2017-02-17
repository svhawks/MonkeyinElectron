const mkdirp = require('mkdirp');
const exist = require('3x1st');

function run() {
  const checkConfig = (callback) => {
    exist(`${process.env.HOME}/.mie/config.json`)
      .then(() => {
        callback(null, "Config exist");
      })
      .catch(() => {
        console.log("Config does not exist");
        fs.writeFile(`${process.env.HOME}/.mie/config.json`, '{ "sites": [] }', 'utf8', (err) => {
          if (err) {
            callback(err, null)
          } else {
            callback(null, "Config created");
          }
        });
      })
  }

  exist(`${process.env.HOME}/.mie/scripts`)
    .then(() => {
      console.log("Exist");

      checkConfig((err, output) => {
        if (err) console.error(err);
        else console.log(output);
      })
    })
    .catch(() => {
      console.log("Not exist");

      mkdirp(`${process.env.HOME}/.mie/scripts`, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Scripts dir created");
          }
      })

      checkConfig((err, output) => {
        if (err) console.error(err);
        else console.log(output);
      })
    })
}

function inter(val) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      console.log("Checking your config..");
      inter(val * 2);
      run();
      resolve();
    }, val);
  });
}

inter(10000)
