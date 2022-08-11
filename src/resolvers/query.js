module.exports = {
    requests: async(parent, args, {models}) => {
        return await models.Request.find({})
    },
    users: async(parent, args, {models}) => {
        return await models.User.find({})
    },
    user: async(parent, {username}, {models}) => {
        return await models.User.findByOne(username)
    },
    me: async(parent, args,{models, user}) => {
        return await models.User.findById({_id: user.id})
    }
}