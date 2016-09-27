var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Recipes = require('../models/recipes');

var recipeRouter = express.Router();

recipeRouter.use(bodyParser.json());

recipeRouter.route('/')
.get(function (req, res, next) {
    Recipes.find(req.query)
        .exec(function (err, recipe) {
        if (err) next(err);
        res.json(recipe);
    });
})

.post(function (req, res, next) {
    Recipes.create(req.body, function (err, recipe) {
        if (err) next(err);
        console.log('Recipe created!');
        var id = recipe.id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the recipe with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Recipes.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});




recipeRouter.route('/:recipeId')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Recipes.findById(req.params.recipeID)
        .exec(function (err, recipe) {
        if (err) next(err);
        res.json(recipe);
    });
})

.put(Verify.verifyOrdinaryUser,  function (req, res, next) {
    Recipes.findByIdAndUpdate(req.params.recipeID, {
        $set: req.body
    }, {
        new: true
    }, function (err, recipe) {
        if (err) next(err);
        res.json(recipe);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        Recipes.findByIdAndRemove(req.params.recipeID, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});





recipeRouter.route('/:recipeId/ratings')
.all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {
    Recipes.findById(req.params.recipeId)
        .exec(function (err, recipe) {
        if (err) next(err);
        res.json(recipe.rating);
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    Recipes.findById(req.params.recipeId, function (err, recipe) {
        if (err) next(err);
        req.body.postedBy = req.decoded._id;
        recipe.rating.push(req.body);
        recipe.save(function (err, recipe) {
            if (err) next(err);
            console.log('Updated Rating!');
            res.json(recipe);
        });
    });
})

.delete(Verify.verifyAdmin, function (req, res, next) {
    Recipes.findById(req.params.recipeId, function (err, recipe) {
        if (err) next(err);
        for (var i = (recipe.rating.length - 1); i >= 0; i--) {
            recipe.rating.id(recipe .rating[i]._id).remove();
        }
        recipe.save(function (err, result) {
            if (err) next(err);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all ratings!');
        });
    });
});










recipeRouter.route('/:recipeId/:ingredientID')

.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Recipes.findById(req.params.dishId)
        .exec(function (err, recipe) {
        if (err) next(err);
        res.json(recipe.comments.id(req.params.commentId));
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Recipes.findById(req.params.recipeId, function (err, recipe) {
        if (err) next(err);
        recipe.rating.id(req.params.ratingID).remove();
        
        req.body.postedBy = req.decoded._id;
        
        recipe.rating.push(req.body);
        recipe.save(function (err, recipe) {
            if (err) next(err);
            console.log('Updated Comments!');
            res.json(recipe);
        });
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Recipes.findById(req.params.recipeId, function (err, recipe) {
        if (recipe.rating.id(req.params.ratingId).postedBy
           != req.decoded._id) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        recipe.comments.id(req.params.recipeId).remove();
        recipe.save(function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });
});



module.exports = recipeRouter;