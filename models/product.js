const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 225,
        trim: true
    },
    price: {
        type: Number,
        required: function() {
            return this.isActive;
        }
        ,
        min: 0,
        max: 1000
    },
    description: {
        type: String,
        minlength: 20
    },
    imageUrl: String,
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: {
        type: Array,
        validate: {
            validator: function (value) {
                return value && value.length > 0;
            },
            message: "Ürün için en az bir etiket giriniz! "
            
        }

    },
    isActive: Boolean,
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: false
        }
    ]
});

module.exports = mongoose.model('Product', productSchema);