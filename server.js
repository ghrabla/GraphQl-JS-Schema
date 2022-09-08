const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description : 'this represents a book written by an author',
    fields: () => ({
        id : { type : GraphQLNonNull(GraphQLInt) },
        name : { type : GraphQLNonNull(GraphQLString) },
        authorId : { type : GraphQLNonNull(GraphQLInt) },
        author : {
            type : AuthorType,
            resolve : (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description : 'this represents author of a book',
    fields: () => ({
        id : { type : GraphQLNonNull(GraphQLInt) },
        name : { type : GraphQLNonNull(GraphQLString) },
        books : {type : new GraphQLList(BookType),
         resolve : (author) =>{
          return books.filter(book => author.id === book.authorId)
         }
        }
       
    })
})


const RootQueryType = new GraphQLObjectType({
    name : 'Query',
    description : 'Root Query',
    fields: () => ({
        book: {
            type : BookType ,
            description : 'one Book',
            args :{
                id : { type : GraphQLInt }
            },
            resolve : (parent,args) => books.find(book => book.id === args.id)
        },
        books: {
            type : new GraphQLList(BookType) ,
            description : 'List of All Books',
            resolve : () => books
        },
        authors: {
            type : new GraphQLList(AuthorType) ,
            description : 'List of All Authors',
            resolve : () => authors
        },
        author: {
            type : AuthorType ,
            description : 'one Author',
            args : {
                id : { type : GraphQLInt }
            },
            resolve : (parent,args) => authors.find(author => author.id === args.id )
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name : 'Mutation',
    description : 'root mutation',
    fields: () => ({
        addbook:{
            type : BookType,
            description : 'add book ',
            args : {
                name : {type: GraphQLNonNull(GraphQLString)},
                authorId : {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent,args)=> {
                const book = {id : books.length + 1,name: args.name,authorId:args.authorId}
                books.push(book)
                return book
            }
        },
        addauthor:{
            type : AuthorType,
            description : 'add author ',
            args : {
                name : {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent,args)=> {
                const author = {id : authors.length + 1,name: args.name}
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql',expressGraphQL({
    schema:schema,
    graphiql:true
}))
app.listen(5000.,()=>console.log('server is running succesfuly'))