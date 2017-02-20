var sites = require(process.env.HOME + '/.mie/config.json').sites;

function findMatch(url) {
  return sites.filter((site) => {
    return site.match === url ? site : '';
  })
}

console.log(findMatch('http://google.com'));
