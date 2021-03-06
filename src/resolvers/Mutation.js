import uuidv4 from 'uuid/v4';

const Mutation = {
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
    updateUser(parents, args, ctx, info) {
        const { id, data } = args;
        const { db } = ctx;

        const user = db.users.find(user => user.id === id)

        if (!user) throw new Error('User not found.');

        if (typeof data.email === "string") {
            const emailTaken = db.users.find(user => user.email === data.email);

            if (emailTaken) throw new Error('Email taken.');
            
            user.email = data.email;
        }

        if (typeof data.name === "string") user.name === data.name;
        if (typeof data.age !== "undefined") user.age === data.age;

        return user;  
    },
    createPost(parents, args, { db, pubSub }, info) {
        const userExists = db.users.some(user => {
            return user.id === args.data.author;
        })
        
        if (!userExists) throw new Error('No user found.');

        const post = {
            id: uuidv4(),
            ...args.data
        }

        db.posts.push(post);
        
        // @subscribe from @post - see Subscription.js
        if (args.data.published) {

            pubSub.publish('post', { 
                post: {
                    mutation: 'CREATED',
                    data: post
                }
             });

        }

        return post;
    },
    updatePost(parents, args, cxt, info) {
        const { db, pubSub } = cxt;
        const { id, data } = args;

        const post = db.posts.find(post => post.id === id);
        const originalPost = { ...post };
        
        if (!post) throw new Error('Post not found.');

        if (typeof data.title === "string")  post.title = data.title;
        if (typeof data.body === "string") post.body = data.body;

        if (typeof data.published === "boolean") {
            post.published = data.published;

            if (originalPost.published && !post.published) {
                // deleted
                pubSub.publish('post', {
                    post: {
                        mutation: 'DELETED',
                        data: originalPost
                    }
                })
            } else if (!originalPost.published && post.published) {
                // created
                pubSub.publish('post', {
                    post: {
                        mutation: 'CREATED',
                        data: post
                    }
                })
            }
        } else if (post.published) {
           pubSub.publish('post', {
               post: {
                   mutation: 'UPDATED',
                   data: post
               }
           })
        }
        
        return post;
    },
    deletePost(parents, args, ctx, info) {
        const { id } = args;
        const { db, pubSub } = ctx;

        const postIndex = db.posts.findIndex(post => post.id === id);

        if (postIndex === -1) throw new Error('Post not found.');

        const deletedPost = db.posts.splice(postIndex, 1);
        db.comments = db.comments.filter(comment => comment.post !== id);

         // @subscribe from @post - see Subscription.js
         if (deletedPost[0].published) {
            pubSub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: deletedPost[0]
                }
            })
         }

        return deletedPost[0];
    },
    createComment(parents, args, { db, pubSub }, info) {
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
        // @subscribe from @comment - see Subscription.js
        pubSub.publish(`comment ${args.data.post}`, { 
            comment: {
                mutation: 'CREATED',
                data: comment
            }
         });

        return comment;
    },
    updateComment(parent, args, ctx, info) {
        const { id, data } = args;
        const { db, pubSub } = ctx;

        const comment = db.comments.find(comment => comment.id === id);

        if (!comment) throw new Error('Comment not found.');

        if (typeof data.text === "string") {
            comment.text = data.text;
        }

        // @subscribe from @comment - see Subscription.js
        pubSub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment
            }
        })

        return comment;
    },
    deleteComment(parent, args, ctx, info) {
        const { id } = args;
        const { db, pubSub } = ctx;

        const commentIndex = db.comments.findIndex(comment => comment.id === id);

        if (commentIndex === -1) throw new Error('Comment not found.');

        const deletedComment = db.comments.splice(commentIndex, 1);

        // @subscribe from @comment - see Subscription.js
        pubSub.publish(`comment ${deletedComment.post}`, {
            comment: {
                mutation: 'DELETED',
                data: deletedComment[0]
            }
        })

        return deletedComment[0];
    }
}

export { Mutation as default };