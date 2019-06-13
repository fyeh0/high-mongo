var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Requiring models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/highMuseumEvents", {
  useNewUrlParser: true
});

// Routes

// A GET route for scraping the High Museum website
app.get("/scrape", function(req, res) {
  axios.get("https://high.org/high-events").then(function(response) {
    var $ = cheerio.load(response.data);
    $("#hma_content.archive li").each(function(i, element) {
      var result = {};

      result.title = $(this).find("h2").text().trim();
      result.summary = $(this).find("p").text();
      result.link = $(this).find("a").attr("href");
    

      db.Event
        .create(result)
        .then(function(dbEvent) {
          console.log(dbEvent);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

// Route for getting all events from the db
app.get("/events", function(req, res) {
  db.Event
    .find()
    .then(function(dbEvent) {
      res.json(dbEvent);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific event by id, populate it with it's note
app.get("/events/:id", function(req, res) {
  db.Event
    .findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function(dbEvent) {
      res.json(dbEvent);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an event's associated Note
app.post("/events/:id", function(req, res) {
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Event.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { note: dbNote._id } },
        { new: true }
      );
    })
    .then(function(dbEvent) {
      res.json(dbEvent);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
