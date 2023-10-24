const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet'); // adds a bunch of standard security to server
const Book = require('./models/Book.js');
require('dotenv').config();
require('./config/db.js');
const PORT = 3000;


const app = express();


// START MIDDLEWARE //
app.use(express.json());
app.use(cors({
    origin: "*"
}));
app.use(morgan('dev'));
app.use(helmet());
// END MIDDLEWARE //

// START ROUTES //


// find   - finds everything
// .find()
app.get('/books', async (req, res) => {
    const allBooks = await Book.find();
    res.send(allBooks);
})

// findOne
// NOTE: the title of a book might have spaces, so you'd replace spaces within URLS for the GET requests with %20
app.get('/book/:searchTitle', (req, res) => {
    const searchTitle = req.params.searchTitle;
    Book.findOne({title: searchTitle})
        .then(foundBook => {
            if(foundBook){
                res.send(foundBook);
            }else{
                res.status(404).send("Book not found");
            }
        })
        .catch(error => {
            // this error is a catch-all for all other errors during database queries
            res.status(500).send("Internal server error", error);
        })
})
 
// findById
app.get('/books/:id', async (req, res) => {
    const bookId = req.params.id;
    const foundBooks = await Book.findById(bookId);
    res.send(foundBooks);
})

// create
// which i think can insert one or more documents into a collection
app.post('/book', async (req, res) => {
    try{
        const book = req.body;
        const dbResponse = await Book.create(book);
        res.status(201).send(dbResponse);
    }catch(error){
        res.status(500).send("server error", error);
    }
})

// insertMany
app.post('/books', async (req, res) => {
    try {
      const books = req.body;
      // Insert the books into the database.
      const dbResponse = await Book.insertMany(books);
      res.status(201).send(dbResponse);
    } catch (error) {
      console.error('Error inserting books:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
});

// findByIdAndUpdate
app.put('/books/:id', async (req, res) => {
    try{
        const bookId = req.params.id;
        const updatedBook = req.body;
        const dbResponse = await Book.findByIdAndUpdate(bookId, updatedBook, { new: true });
        res.status(200).send(dbResponse);
    }catch(error){
        res.status(500).send("server error");
    }
})

// deleteMany
app.delete('/books/:bookTitlePattern', async(req, res) => {
    try{
        const bookTitlePattern = req.params.bookTitlePattern;
        // case-insensitive flag is 'i'
        // other flag is 'g' for global matching (match all occurences in the string not just the first one) -- tbh i'm not sure how this is useful???
        // multiline matching is 'm'
        // if you want case-sensitive, leave out the flag
        const regexPattern = new RegExp(bookTitlePattern, 'i');
        const dbResponse = await Book.deleteMany({title: regexPattern});
        res.status(200).send(dbResponse);
    }catch(error){
        res.status(500).send("server error");
    }
})

// END ROUTES //
app.listen(PORT, () => {
    console.log(`Server LIVE on port ${PORT}`);
});


