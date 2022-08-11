require('dotenv').config();
const db = require('./db');
const express = require('express')
const {ApolloServer} = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const models = require('./models');
const helmet = require('helmet')
const cors = require('cors')
const {ApolloServerPluginDrainHttpServer,
       ApolloServerPluginLandingPageLocalDefault} = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema')
const {webSocketServer} = require('ws')
const {useServer} = require('graphql-ws/lib/use/ws')
const http = require('http');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5001;
const TEST_DB = process.env.TEST_DB;

const getUser = token => {
    if(token) {
        try{
            return jwt.verify(token, process.env.JWT_SECRET);
        }catch(err){
            throw new Error('Session Invalid');
        }
    }
}

async function startApolloServer(typeDefs, resolvers) {
    const app = express()
    app.use(helmet())
    app.use(cors())
    db.connect(TEST_DB)
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
        cache: 'bounded',
        context:({req}) => {
            const token = req.headers.authorization;
            const user = getUser(token);
            return {models, user}
        },
        plugins: [
            ApolloServerPluginDrainHttpServer({httpServer}),
            ApolloServerPluginLandingPageLocalDefault({embed: true})]
    })
    await server.start()
    server.applyMiddleware({app, path: '/api'});
    await new Promise(resolve => httpServer.listen({port}, resolve));
    console.log(`🚀 Server listening at http://localhost:${port}${server.graphqlPath}`)
}

startApolloServer(typeDefs, resolvers)