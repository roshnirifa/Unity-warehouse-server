const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

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
            res.json(products)

        })

        app.get('/product/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await allProductCollection.findOne(query);

            res.json(result)

        })

        // add new items POST

        app.post('/addItems', async (req, res) => {
            const addItems = req.body;
            console.log(addItems);
            const result = await addItemsCollection.insertOne(addItems);
            res.json({ success: "add new item succsfully" })


        })

        app.get('/myItems', async (req, res) => {
            const myItmes = await addItemsCollection.find({}).toArray();
            res.send(myItmes);

        })
        // delete myItems
        app.delete('/myItems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await addItemsCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/restockQuantity/:id', async (req, res) => {
            const data = req.body;

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await allProductCollection.findOne(filter);
            const updatedQuantity = parseInt(result.quantity) + parseInt(data.quantity);
            const data2 = { quantity: updatedQuantity }
            const updateDoc = { $set: data2 };
            const result2 = await allProductCollection.updateOne(filter, updateDoc);
            res.json(result2);
        });

        app.put('/delivered/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await allProductCollection.findOne(filter);
            if (result.quantity > 0) {
                const updatedQuantity = parseInt(result.quantity) - 1;
                const data2 = { quantity: updatedQuantity }
                const updateDoc = { $set: data2 };
                const result2 = await allProductCollection.updateOne(filter, updateDoc);
                res.json(result2);
            }
            else {
                res.json({ error: "quantity is decreases" });
            }


        });
        app.delete('/manageItems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allProductCollection.deleteOne(query);
            res.send(result);
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


