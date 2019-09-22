import { GraphQLServer } from 'graphql-yoga';

const users = [
    {id: '1', name: 'Jeff', email: 'jeff@gmail.com', age: '25'},
    {id: '2', name: 'Angei', email: 'angei@gmail.com', age: '24'},
    {id: '3', name: 'Faith', email: 'faith@gmail.com', age: '23'}
]

const posts = [
    {id: '1', title: 'Post 1', body: 'This is my first post', published: true, author: '1'},
    {id: '2', title: 'Post 2', body: 'This is my second post', published: false, author: '1'},
    {id: '3', title: 'Post 3', body: 'This is my third post', published: true, author: '2'}
]

const comments = [
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