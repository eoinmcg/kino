const express = require("express");
const path = require("path");
const cheerio = require("cheerio");

const app = express();
const port = process.env.PORT || 3001;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedTimetable = { html: null, timestamp: 0 };

const URLS = {
  timetable: "https://cinemaxbg.com/timetable.php?lng=en",
  movies: "https://cinemaxbg.com/?lng=en",
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/timetable", async (req, res) => {
  const now = Date.now();

  // Return cached if fresh
  if (cachedTimetable.html && now - cachedTimetable.timestamp < CACHE_TTL) {
    return res.type("html").send(cachedTimetable.html);
  }

  try {
    const [timetableRes, moviesRes] = await Promise.all([
      fetch(URLS.timetable),
      fetch(URLS.movies),
    ]);

    if (!timetableRes.ok || !moviesRes.ok) {
      throw new Error("Failed to fetch cinema data");
    }

    const [timetableHtml, moviesHtml] = await Promise.all([
      timetableRes.text(),
      moviesRes.text(),
    ]);

    const $t = cheerio.load(timetableHtml);
    const $m = cheerio.load(moviesHtml);

    const html = `
      <div data-scraped="${now}">
        <table>${$t("table#timetable").html()}</table>
        ${$m("body").html()}
      </div>
    `;

    // Update cache
    cachedTimetable = { html, timestamp: now };

    res.type("html").send(html);
  } catch (error) {
    console.error("Scraping error:", error.message);
    res
      .status(503)
      .send("Cinema data temporarily unavailable. Please try again later.");
  }
});

const server = app.listen(port, () =>
  console.log(`Kino app listening on port ${port}`),
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
