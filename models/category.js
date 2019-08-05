const mongoose = require('mongoose');

categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 225
    },
    description: {
        type: String,
        minlength: 20
    }
});

module.exports = mongoose.model('Category', categorySchema);