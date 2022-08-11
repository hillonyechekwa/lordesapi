const Query = require('./query');
const Mutation = require('./mutation')
const User = require('./user')
const Service = require('./service')
const Request = require('./request')
const GraphQLDateTime = require('graphql-iso-date')

module.exports = {
    Query,
    Mutation,
    User,
    Service,
    Request,
    DateTime: GraphQLDateTime
}