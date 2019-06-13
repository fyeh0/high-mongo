var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var EventSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  summary: {
      type: String,
      required: true
  },
  link: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Event = mongoose.model("Event", EventSchema);

module.exports = Event;
