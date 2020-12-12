const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const PostModel = require('../models/PostModel');
const isImageUrl = require('is-image-url');
const validUrl = require('valid-url');


router.get('/', authorize, (request, response) => {

    // Endpoint to get posts of people that currently logged in user follows or their own posts

    PostModel.getAllForUser(request.currentUser.id, (postIds) => {

        if (postIds.length) {
            PostModel.getByIds(postIds, request.currentUser.id, (posts) => {
                response.status(201).json(posts)
            });
            return;
        }
        response.json([])

    })

});

router.post('/', authorize, (request, response) => {
    let text = request.body.text;
    let url = request.body.media.url;
    let type = request.body.media.type;

    if(text === null && url === null){
        console.log("You need either text or media in a post!");
        response.status(400).json({});
    }
    else if(text === null && !validUrl.isUri(url)){
        console.log("Provided url is not valid!");
        response.status(400).json({});
    }
    else if(type === "video" && !validUrl.isUri(url)){
        console.log("Provided url is not valid!");
        response.status(400).json({});
    }
    else if(type === "image" && !isImageUrl(url)){
        console.log("Url is not an image!");
        response.status(400).json({});
    }
    else if(type === "video" && isImageUrl(url)){
        console.log("Url is not a video!");
        response.status(400).json({});
    }
    else {
        let params = {
            userId: request.currentUser.id,
            text: text,
            media: {
                url: url,
                type: type,
            }
        }
        PostModel.create(params, () => {
            response.status(201).json();
        })
    }
});


router.put('/:postId/likes', authorize, (request, response) => {
    PostModel.like(request.currentUser.id, request.params.postId, () => {
        response.status(201)
    });
    response.json([])
    // Endpoint for current user to like a post
});

router.delete('/:postId/likes', authorize, (request, response) => {
    PostModel.unlike(request.currentUser.id, request.params.postId, () => {
        response.status(201)
    });
    response.json([])

    // Endpoint for current user to unlike a post

});

module.exports = router;
