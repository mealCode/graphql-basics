import { GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4';

let users = [
    {id: '1', name: 'Jeff', email: 'jeff@gmail.com', age: '25'},
    {id: '2', name: 'Angei', email: 'angei@gmail.com', age: '24'},
    {id: '3', name: 'Faith', email: 'faith@gmail.com', age: '23'}
]

let posts = [
    {id: '1', title: 'Post 1', body: 'This is my first post', published: true, author: '1'},
    {id: '2', title: 'Post 2', body: 'This is my second post', published: false, author: '1'},
    {id: '3', title: 'Post 3', body: 'This is my third post', published: true, author: '2'}
]

let comments = [
    {id: '1', text: 'This is my first comment.', author: '1', post: '1'},
    {id: '2', text: 'This is my second comment.', author: '1', post: '1'},
    {id: '3', text: 'This is my third comment.', author: '2', post: '2'},
    {id: '4', text: 'This is my fourth comment.', author: '3', post: '3'}
]

// Type definitions (schema)
const typeDefs = `
    type Query { 
        users(query: String): [User!]!
        me: User!
        posts(query: String): [Post!]!
        comments: [Comment!]!
    }

    type Mutation {
        createUser(data: CreateUserInput!): User!
        deleteUser(id: String!): User!
        createPost(data: CreatePostInput!): Post!
        createComment(data: CreateCommentInput!): Comment!
    }

    input CreateUserInput {
        name: String! 
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`;

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
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users;
            }

            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase());
            })
        },
        posts(parent, args, ctx, info) { 
            if (!args.query) {
                return posts;
            }

           return posts.filter((post) => {
               const isTitleMatch = post.title.toLowerCase().includes(args.query);
               const isBodyMatch = post.body.toLowerCase().includes(args.query);

               return isTitleMatch || isBodyMatch;
           })
        },
        comments(parent, args, ctx, info) {
            return comments;
        }
    },
    Mutation: {
        createUser(parent, args, ctx, info) {
           const emailTaken = users.some(user => {
               return user.email === args.data.email;
           })

           if (emailTaken) throw new Error('Email taken.');

           const user = {
               id: uuidv4(),
               ...args.data
           }

           users.push(user);
           return user;
        },
        deleteUser(parent, args, ctx, info) {
            const userIndex = users.findIndex(user => {
                return user.id === args.id;
            })

            if (userIndex === -1) throw new Error('User not found.');

            const deletedUser = users.splice(userIndex, 1);

            posts = posts.filter(post => {
                const match = post.author === args.id;

                if (match) {
                    comments = comments.filter(comment => {
                        comment.post !== post.id;
                    })
                }

                return !match;
            })

            comments = comments.filter(comment => {
                comment.author !== args.id;
            })

            return deletedUser[0];

        },
        createPost(parents, args, ctx, info) {
            const userExists = users.some(user => {
                return user.id === args.data.author;
            })
            
            if (!userExists) throw new Error('No user found.');

            const post = {
                id: uuidv4(),
                ...args.data
            }

            posts.push(post);
            return post;
        },
        createComment(parents, args, ctx, info) {
            const userExists = users.some(user => {
                return user.id === args.data.author;
            })

            const postExists = posts.some(post => {
                return post.id === args.data.post && post.published;
            })

            if (!userExists || !postExists) throw new Error('Unable to find user or post.');

            const comment = {
                id: uuidv4(),
                ...args.data
            }

            comments.push(comment);
            return comment;
        }
    },
    Post: {
        author(parent, args, ctx, info) {
            return users.find(user => {
                return user.id === parent.author;
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter(comment => {
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter(post => {
                return post.author === parent.id;
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter(comment => {
                return comment.author === parent.id;
            })
        }
    },
    Comment: {
        author(parent, args, ctx, info) {
           return users.find(user => {
               return user.id === parent.author;
           })
        },
        post(parent, args, ctx, i) {
            return posts.find(post => {
                return post.id === parent.post;
            })
        }
    }
}

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => {
    console.log('The server is up at port 4000');
});