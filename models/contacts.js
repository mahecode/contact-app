const mongoose = require('mongoose');

//contact model
const contactSchema = mongoose.Schema({
  name: {
    type:String,
    required: true
  },
  mo_no: {
    type: Number,
    required: true
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

const Contact = module.exports = mongoose.model('Contact', contactSchema);
