// grab the things we need
var mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;

var SchemaTypes = mongoose.Schema.Types;


var ratingSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }
}, {
    timestamps: true
});

var ingredientSchema = new Schema({
    ingredientdetails:  {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// create a schema
var recipeSchema = new Schema({
    recipeID: {
    	type: Number,
    	required: true,
    	unique: true
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },   
    description: {
        type: String,
        required: true
    }, 
    how_method: {
        type: String,
        required: true
    },
    public: {
        type: Boolean,
        default:false
    },
    ratings:[ratingSchema],
    ingredients:[ingredientSchema]
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Recipes = mongoose.model('Recipe', recipeSchema);

// make this available to our Node applications
module.exports = Recipes;