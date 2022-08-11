module.exports = {
    services: async(user, args, {models}) => {
        return await models.Service.find({provider: user._id}).sort({_id: -1})
    },
    requestNotifs: async(user, args,{models}) => {
        return await models.Request.find({_id: {$in: user.requestNotifs}})
    },
    acceptedReqs: async(user, args,{models}) => {
        return await models.Request.find({_id: {$in: user.acceptedReqs}})
    },
}
