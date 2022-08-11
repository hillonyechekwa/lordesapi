const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {AuthenticationError, ForbiddenError} = require('apollo-server-express')
require('dotenv').config()

module.exports = {
    signUp: async(parent, {username, email, password, role}, {models}) => {
        var email = email.trim().toLowerCase();
        var saltRounds = 10;
        var encryptedPassword = await bcrypt.hash(password, saltRounds);

        try{
            const user = await models.User.create({
                username,
                email,
                password: encryptedPassword,
                role
            })

            return jwt.sign({id: user._id}, process.env.JWT_SECRET)
        }catch(err){
            console.error(err)
            throw new Error('Error creating account')
        }
    },
    signIn: async(parent, {username, email, password}, {models}) => {
        if(email) {
            var email = email.trim().toLowerCase();
        }

        const user = await models.User.findOne({
            $or: [{email}, {username}]
        })

        if(!user) {
            throw new AuthenticationError('Error signing in');
        }
        const valid = await bcrypt.compare(password, user.password)
        if(!valid) {
            throw new AuthenticationError("Error Signing in")
        }

        return await jwt.sign({id: user._id}, process.env.JWT_SECRET)
    },
    createService: async(parent, {name, cost}, {models, user}) => {
        if(!user) {
            throw new AuthenticationError("You have to be signed in.")
        }

        const currentUser = await models.User.findById(user.id)
        if(currentUser.role !== 'stylist'){
            throw new AuthenticationError(" You can't take this action")
        }
        console.log("user id", mongoose.Types.ObjectId(user.id))

        return await models.Service.create({
            name,
            cost,
            provider: mongoose.Types.ObjectId(user.id)
        })
    },
    initRequest: async(parent, {service, reqStatus}, {models, user}) => { 
        if(!user) {
            throw new AuthenticationError("You have to be signed in.")
        }

        const currentUser = await models.User.findById(user.id)
        if(currentUser.role !== 'client'){
            throw new ForbiddenError("You can't take this action")
        }
        //create a new request
         return await models.Request.create({
            request: mongoose.Types.ObjectId(service),
            sender: mongoose.Types.ObjectId(user.id),
            status: reqStatus
        })
        
    },
    requestService: async(parent, {request}, {models, user}) => {
        if(!user) {
            throw new AuthenticationError("You have to be signed in.")
        }

        const currentUser = await models.User.findById(user.id)
        if(currentUser.role !== 'client'){
            throw new ForbiddenError("You can't take this action")
        }

        let req = await models.Request.findById(request)
        let service = await models.Service.findById(String(req.request))
        //update the request's recipients notification
        return await models.User.findByIdAndUpdate(
            String(service.provider),
            {
                $push: {
                    requestNotifs: mongoose.Types.ObjectId(req)
                },
                $inc: {
                    requestNotifsCount: 1
                }
            }, {new: true}
        )
    },
    deleteService: async(parent, {service}, {models, user}) => {
        if(!user) {
            throw new AuthenticationError("You have to be signed in")
        }

        let currentUser = await models.User.findById(user.id)

        if(currentUser.role !== 'stylist'){
            throw new AuthenticationError('You don\'t have permissions')
        }

        let serviceId = await models.Service.findById(service)
        if(serviceId && String(serviceId.provider) !== user.id){
            throw new ForbiddenError("You don't have permissions to delete this.")
        }

        try{
            await models.Service.findOneAndRemove({_id: service})
            return true
        }catch(err) {
            console.error(err)
            return false
        }
    },
    deleteRequest: async(parent, {request}, {models, user}) => {
        if(!user) {
            throw new AuthenticationError("You have to be signed in")
        }

        let currentUser = await models.User.findById(user.id)

        if(currentUser.role !== 'client'){
            throw new AuthenticationError('You don\'t have permissions')
        }

        let requestId = await models.Request.findById(request)

        let service = await models.Service.findById(String(requestId.request))
        let serviceProvider = await models.User.findById(String(service.provider))
        console.log(serviceProvider.requestNotifs)

        let notifHasReq = await serviceProvider.requestNotifs.indexOf(request)

        let acceptHasReq = await serviceProvider.acceptedReqs.indexOf(request)

        

        if(requestId && String(requestId.sender) !== user.id){
            throw new ForbiddenError("You don't have permissions to delete this.")
        }
        // let service = await models.Service.findById(String(requestId.request))
        // console.log('provider', String(service.provider))

        try{
            if(notifHasReq >= 0) {
            await models.User.findByIdAndUpdate(
                String(service.provider),
                {
                    $inc: {
                        requestNotifsCount: -1
                    }
                }, {new: true}
            )
            }

            if(acceptHasReq >= 0) {
                await models.User.findByIdAndUpdate(
                    String(service.provider),
                    {
                        $inc: {
                            acceptedReqsCount: -1
                        }
                    }, {new: true}
                )
            }
            
            await models.Request.findOneAndRemove({_id: request})
            return true
        }catch(err) {
            console.error(err)
            return false
        }
    },
    acceptRequest: async(parent, {request}, {models, user}) => {
        if(!user) {
            throw new AuthenticationError("You have to be signed in")
        }

        let currentUser = await models.User.findById(user.id)

        if(currentUser.role !== 'stylist'){
            throw new AuthenticationError('You don\'t have permissions')
        }
        // let requestId = await models.Request.findById(request)
        let hasReq = await currentUser.requestNotifs.indexOf(request)
        if(hasReq >= 0) {

            await models.User.findByIdAndUpdate(
                user.id,
                {
                    $pull:{
                        requestNotifs: mongoose.Types.ObjectId(request)
                    },
                    $inc:{
                        requestNotifsCount: -1
                    }
                }, 
                {new: true}
            )
        }

        return await models.User.findByIdAndUpdate(
            user.id,
            {
                $push: {
                    acceptedReqs: mongoose.Types.ObjectId(request)
                },
                $inc: {
                    acceptedReqsCount: 1
                }
            }, {new: true}
        )
    },
    getLocation: async(parent, {lng, lat}, {models, user}) => {
        if(!user) {
            throw new AuthenticationError("You have to be signed in")
        }

        return models.Location.create({
            lng,
            lat,
            owner: mongoose.Types.ObjectId(user.id)
        })
    },
    updateLocation: async(parent, {locId, lng, lat} , {models, user}) => {
        if(!user) {
            throw new AuthenticationError("You have to be signed in")
        }
        
        let locationOwner = await models.Location.findById(locId)
        if(locationOwner && String(locationOwner.owner) !== user.id){
            throw ForbiddenError("You don't have permission to update")
        }

        return models.Location.findByIdAndUpdate(
            locId,
            {
                $set:{
                    lng: lng
                },
                $set:{
                    lat: lat
                }
            }, {new: true}
        )
    }
}