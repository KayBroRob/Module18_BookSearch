import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas';
import { authenticateToken, AuthenticationError } from './services/auth.js';

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      authenticateToken({ req });
      return { user: (req as any).user, AuthenticationError };
    }
  }
));
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.join(__dirname, '../client/build')));

   app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
   });
  }
  app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log('API server running on ${PORT}!');
      console.log('Use GraphQL at http://localhost:${PORT}/graphql');
    });
  });
};

startApolloServer();


