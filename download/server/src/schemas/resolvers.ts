import User from "../models/User";
import { signToken } from "../services/auth";
import AuthenticationError from 'apollo-server-express';

interface AddUsersArgs {
    input:{
        username: string;
        email: string;
        password: string;
    }
}

interface LoginArgs {
    email: string;
    password: string;
}

interface SaveBookArgs {
    bookData: {
        title: string;
        bookId: string;
    };
}

interface RemoveBookArgs {
    bookId: string;
}

interface ContextUser {
    _id: string;
    username: string;
    email: string;
}

interface ResolverContext {
    user?: ContextUser;
}


const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: ResolverContext) => {
            if (context.user) {
                const currentUser = context.user
                const userData = await User.findOne({ _id: currentUser._id }) .select('-__v -password');
                return userData;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        addUser: async (_parent: any, { input }: AddUsersArgs) => {
            const user = await User.create({ ...input });
            const token = signToken(user);
            return { token, user };
        },
        login: async (_parent: any, { email, password }: LoginArgs) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user found');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect entry');
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (_parent: any, { bookData }: SaveBookArgs, context: ResolverContext) => {
            if (context.user) {
                const currentUser = context.user;
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: currentUser._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Log into your account to save books!');
        },
        removeBook: async (_parent: any, { bookId }: RemoveBookArgs, context: ResolverContext) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Log into your account to remove books!');
        },
    },
};

export default resolvers;
