const Query = {
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
}

export { Query as default };