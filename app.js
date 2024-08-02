const express = require('express');
const mysql = require('mysql2');
const app = express();
const multer = require('multer');


// Set up Multer middleware to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'c237_supermarketapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
}
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');
// enable from processing
app.use(express.urlencoded({
    extended: false
}));
// enable static files
app.use(express.static('public'));


//Define routes
//Example:
app.get('/', (req, res) => {
    connection.query('SELECT * FROM products', (error, results) => {
        if (error) throw error;
        res.render('index', { products:results }); // Render HTML page with data
    });
});

// search via ID
app.get('/product/:id', (req, res)=> {
    // extract product ID from the request parameters
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    // fetch data from MySQL based on ID\
    connection.query(sql, [productId], (error, results)=>{
        if (error) {
            console.error('Error querying MySQL:', error.message);
            return res.status(500).send('Error Retrieving product by ID');
        }
        // check if any product with the given ID if found
        if (results.length > 0) {
            // render HTML page with the prduct data
            res.render('product', { product: results[0] });
        } else {
            // if no product with the ID was found, render a 404 error
            res.status(404).send('Product not found');
        };
    });
});

// add product
app.get('/Product',  (req, res)=> {
    res.render('addProduct');
});
app.post('/addProduct', upload.single('image'), (req, res)=> {
    // extract product details from the request body
    const { productName, quantity, price} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // save only filename
    
    } else {
        image = null;
    }

    const sql = 'INSERT INTO products (productName, quantity, price, image) VALUES (?, ?, ?, ?)';
    // insert data into MySQL
    connection.query(sql, [productName, quantity, price, image], (error, results) => {
        if (error) {
            console.error('Error adding product:', error);
            return res.status(500).send('Error adding product');
        }
        // if insertion was successful, redirect to the home page
        res.redirect('/');
    
    });
});

// update product
app.get('/editProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    // fetch data from MySQL
    connection.query( sql, [productId], (error, results) => {
        if (error) {
            console.error('Error querying MySQL:', error.message);
            return res.status(500).send('Error retrieving product by ID');
        }
        // check if any product with the given ID if found
        if (results.length > 0) {
            // render HTML page with the prduct data
            res.render('editProduct', { product: results[0] });
        } else {
            // if no product with the ID was found, render a 404 error
            res.status(404).send('Product not found');
        }
    })
})

app.post('/editProduct/:id', upload.single('images'), (req, res) => {
    const productId = req.params.id;
    // extract product details from the request body
    const { productName, quantity, price } = req.body;

    let image = req.body.currentImage; //retrive current filename
    if (req.file){
        image = req.file.filename;
    }

    const sql = 'UPDATE products SET productName = ?, quantity = ?, price = ?, image = ? WHERE productId = ?';
    // update data in MySQL
    connection.query(sql, [productName, quantity, price, image, productId], (error, results) => {
        if (error) {
            console.error('Error updating product:', error);
            return res.status(500).send('Error updating product');
        } else {
            // if update was successful, redirect to the home page
            res.redirect('/');
        }
    });
});

// delete product
app.get('/deleteProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE productId =?';
    // delete data from MySQL
    connection.query( sql , [productId], (error, results) => {
        if (error) {
            console.error("Error deleting product:", error);
            return res.status(500).send('Error deleting product');
        } else {
            // if deletion was successful, redirect to the home page
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));