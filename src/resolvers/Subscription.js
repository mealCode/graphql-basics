/**
 * @publish('channel name') where 'channel name' is the channel name same with asyncIterator('channel name')
 */

const Subscription = {
    comment: {
        subscribe(parent, args, ctx, info) {
            const { postId } = args;
            const { db, pubSub } = ctx;

            const post = db.posts.find(post => post.id === postId && post.published);

            if (!post) throw new Error('Post not found.');

            return pubSub.asyncIterator(`comment ${postId}`)
            
        }
    },
    post: {
        subscribe(parent, args, ctx, info) {
           const { pubSub } = ctx;
           
           return pubSub.asyncIterator('post');

        }
    }
}

export { Subscription as default };