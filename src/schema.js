const {gql} = require('apollo-server-express');

module.exports = gql`
    scalar DateTime

    type User{
        id: ID!
        username: String!
        email: String!
        password: String!
        bio: String
        role: String!
        services: [Service!]!
        requestNotifsCount: Int!
        requestNotifs: [Request!]
        acceptedReqsCount: Int!
        acceptedReqs: [Request!]
        location: Location
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    type Location{
        lng: String!
        lat: String!
        owner: User!
    }

    type Service{
        id: ID!
        name: String!
        cost: String!
        provider: User!
    }

    type Request{
        id: ID!
        request: Service!
        sender: User!
        status: String!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    type Query{
        requests: [Request!]!
        users: [User!]!
        user(username: String!): User!
        me: User!
    }

    type Mutation{
        createService(name: String!, cost: String!): Service!
        initRequest(service: ID!, reqStatus: String!): Request!
        requestService(request: ID!): User!
        deleteRequest(request: ID!): Boolean!
        deleteService(service: ID!): Boolean!
        acceptRequest(request: ID!): User!
        getLocation(lng: String!, lat: String!): Location!
        updateLocation(locId: ID!, lng: String!, lat: String!): Location!
        signUp(username: String!, email: String!, password: String!, role: String!): String!
        signIn(username: String, email: String, password: String!): String!
    }
`