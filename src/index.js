import { GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4';

import db from './db';

// Resolvers
const resolvers = {
    Query: {
        me() {
            return {
                id: 'abc123',
                name: 'Jeff',
                email: 'jeff@gmail.com',
            }
        },
        users(parent, args, { db }, info) {
            if (!args.query) {
                return db.users;
            }

            return db.users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase());
            })
        },
        posts(parent, args, { db }, info) { 
            if (!args.query) {
                return db.posts;
            }

           return db.posts.filter((post) => {
               const isTitleMatch = post.title.toLowerCase().includes(args.query);
               const isBodyMatch = post.body.toLowerCase().includes(args.query);

               return isTitleMatch || isBodyMatch;
           })
        },
        comments(parent, args, { db }, info) {
            return db.comments;
        }
    },
    Mutation: {
        createUser(parent, args, { db }, info) {
           const emailTaken = db.users.some(user => {
               return user.email === args.data.email;
           })

           if (emailTaken) throw new Error('Email taken.');

           const user = {
               id: uuidv4(),
               ...args.data
           }

           db.users.push(user);
           return user;
        },
        deleteUser(parent, args, { db }, info) {
            const userIndex = db.users.findIndex(user => {
                return user.id === args.id;
            })

            if (userIndex === -1) throw new Error('User not found.');

            const deletedUser = db.users.splice(userIndex, 1);

            db.posts = db.posts.filter(post => {
                const match = post.author === args.id;

                if (match) {
                    db.comments = db.comments.filter(comment => {
                        comment.post !== post.id;
                    })
                }

                return !match;
            })

            db.comments = db.comments.filter(comment => {
                comment.author !== args.id;
            })

            return deletedUser[0];

        },
        createPost(parents, args, { db }, info) {
            const userExists = db.users.some(user => {
                return user.id === args.data.author;
            })
            
            if (!userExists) throw new Error('No user found.');

            const post = {
                id: uuidv4(),
                ...args.data
            }

            db.posts.push(post);
            return post;
        },
        createComment(parents, args, { db }, info) {
            const userExists = db.users.some(user => {
                return user.id === args.data.author;
            })

            const postExists = db.posts.some(post => {
                return post.id === args.data.post && post.published;
            })

            if (!userExists || !postExists) throw new Error('Unable to find user or post.');

            const comment = {
                id: uuidv4(),
                ...args.data
            }

            db.comments.push(comment);
            return comment;
        }
    },
    Post: {
        author(parent, args, { db }, info) {
            return db.users.find(user => {
                return user.id === parent.author;
            })
        },
        comments(parent, args, { db }, info) {
            return db.comments.filter(comment => {
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts(parent, args, { db }, info) {
            return db.posts.filter(post => {
                return post.author === parent.id;
            })
        },
        comments(parent, args, { db }, info) {
            return db.comments.filter(comment => {
                return comment.author === parent.id;
            })
        }
    },
    Comment: {
        author(parent, args, { db }, info) {
           return db.users.find(user => {
               return user.id === parent.author;
           })
        },
        post(parent, args, { db }, i) {
            return db.posts.find(post => {
                return post.id === parent.post;
            })
        }
    }
}

const server = new GraphQLServer({ 
    typeDefs: './src/schema.graphql', 
    resolvers,
    context: {
        db
    }
});

server.start(() => {
    console.log('The server is up at port 4000');
});