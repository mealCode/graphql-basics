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

const db = {
    users,
    posts,
    comments
}

export { db as default };