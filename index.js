const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// Check the server

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j31fp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log('db connet');

        const addItemsCollection = client.db("clothesWareHouse").collection("addItems");
        const allProductCollection = client.db("clothesWareHouse").collection("allProducts");

        // all products POST
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = allProductCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)

        })

        // add new items POST

        app.post('/addItems', async (req, res) => {
            const addItems = req.body;
            console.log(addItems);
            const result = await addItemsCollection.insertOne(addItems);
            res.send({ success: "add new item succsfully" })


        })

        app.get('/myItems', async (req, res) => {
            const myItmes = await addItemsCollection.find({}).toArray();
            res.send(myItmes);

        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

// for cheking the server
app.get('/', (req, res) => {
    res.send("clothes werehouse server is running")
});

app.listen(port, () => {
    console.log("listing to port", port);
})


