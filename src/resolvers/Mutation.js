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
}

export { Mutation as default };