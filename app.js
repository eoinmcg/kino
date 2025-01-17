const express = require("express");
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/timetable', (req, res) => {

  const fs = require("fs");
  const cheerio = require("cheerio");

  const urls = {
      "timetable": "https://cinemaxbg.com/timetable.php?lng=en",
      "movies": "https://cinemaxbg.com/?lng=en",
  };

  Promise.all([
    fetch(urls.timetable),
    fetch(urls.movies)
  ]).then((responses) => {
      return Promise.all(responses.map((response) => {
        return response.text();
      }));
  }).then((data) => {
      let html = `<div data-scraped="${new Date().getTime()}">`;
      const $ = cheerio.load(data[0]);
      html += '<table>' + $('table#timetable').html() + '</table>';
      const $2 = cheerio.load(data[1]);
      html += $2('body').html();
      // fs.writeFileSync('timetable.html', html);
      res.type('html').send(html);
  }).catch((error) => {
      console.log('error', error);
  });
});


const server = app.listen(port, () => console.log(`Kino app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
