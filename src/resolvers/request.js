module.exports = {
    request: async(request, args, {models}) => {
        return await models.Service.findById(request.request)
    },
    sender: async(request, args, {models}) => {
        return await models.User.findById(request.sender)
    }
}