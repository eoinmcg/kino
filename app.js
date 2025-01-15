const express = require("express");
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/timetable', (req, res) => {
  const cheerio = require("cheerio");
  const url = 'https://cinemaxbg.com/timetable.php?lng=en';

fetch(url)
    .then(function (response) {
        return response.text();
    })
    .then(function (html) {
        const $ = cheerio.load(html);
       let timetable = $('table#timetable').html();
        timetable = `<table data-scraped="${new Date().getTime()}">${timetable}</table>`;
        res.type('html').send(timetable);
    })
    .catch(function (err) {
        res.type('html').send(`<div class="error">${err}</div>`);
    });

});


const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
