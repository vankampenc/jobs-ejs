const mongoose = require('mongoose')

const EvSchema = new mongoose.Schema({
    make: {
        type: String,
        required: [true, 'Please provide EV make'],
        maxlength: 50
    },
    model: {
        type: String,
        required: [true, 'Please provide EV model'],
        maxlength: 100
    },
    status: {
        type: String,
        enum: ['credit eligible', 'not credit eligible', 'unknown'],
        default: 'unknown',
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }
},
    {
        timestamps: true
    })


module.exports = mongoose.model('Ev', EvSchema)