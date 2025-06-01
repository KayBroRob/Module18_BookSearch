const typeDefs = `
    type Book {
        bookId: String!
        authors: [String]
        description: String
        title: String!
        image: String
        link: String
    }

    type User {
        _id: ID
        username: String
        email: String
        bookCount: Int
        savedBooks: [Book]
    }

    type Auth {
        token: ID
        user: User
    }

    input BookInput {
        authors: [String]
        description: String
        title: String
        bookId: String
        image: String
        link: String
    }

    type Query {
        me: User
    }

    type Mutation {
        addUser(username: String!, email: String!, password: String!): Auth
        login(email: String!, password: String!): Auth
        saveBook(bookData: BookInput!): User
        removeBook(bookId: String!): User
    }
`;

export default typeDefs;