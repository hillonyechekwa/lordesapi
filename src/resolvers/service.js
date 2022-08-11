module.exports = {
    provider: async(service, args, {models}) => {
        return await models.User.findById(service.provider)
    }
}