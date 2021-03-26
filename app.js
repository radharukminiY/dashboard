const express = require('express');
const app = express();
const port = process.env.PORT || 9080;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongourl = "mongodb://localhost:27017";
let db;
let col_name="userdata";

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public'));
app.set('views','./src/views');
app.set('view engine','ejs');

//health
app.get('/',(req,res) => {
    db.collection(col_name).find({isActive:true}).toArray((err,result) => {
        if(err) throw err;
        res.render('index',{data:result})
    })
})

app.get('/health',(req,res) => {
    res.status(200).send("Health Ok")
})

app.get('/new',(req,res) => {
    res.render('admin')
})

//postUser
app.post('/addUser',(req,res) => {
    const data={
        "name":req.body.name,
        "city":req.body.city,
        "phone":req.body.phone,
        "isActive":true,
        "role":req.body.role?req.body.role:'User'
    }
    db.collection(col_name).insert(data,(err,result) => {
        if(err) throw err;
        //res.status(200).send("Data Added")
        res.redirect('/')
    })
});

//get user
app.get('/users',(req,res) => {
    var query = {}
    if(req.query.city){
        query={city:req.query.city,isActive:true}
    }else{
        query={isActive:true}
    }
    db.collection(col_name).find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//userDetails
app.get('/user/:id',(req,res) => {
    var id = mongo.ObjectID(req.params.id)
    db.collection(col_name).find({_id:id}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})
//updateUser
app.put('/updateUser',(req,res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection(col_name).update(
        {_id:id},
        {
            $set:{
                name:req.body.name,
                city:req.body.city,
                phone:req.body.phone,
                role:req.body.role,
                isActive:true
            }
        },(err,result) => {
            if(err) throw err;
            res.send('Data Updated')
        }
    )
})

//remove
app.delete('/deleteUser',(req,res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection(col_name).remove({_id:id},(err,result) => {
        if(err) throw err;
        res.send('Data Deleted')
    })
})

//deactivate(soft delete)
app.put('/deactivateUser',(req,res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection(col_name).update(
        {_id:id},
        {
            $set:{
                isActive:false
            }
        },(err,result) => {
            if(err) throw err;
            res.send('User Deactivated')
        }
    )
})

//activate(soft delete)
app.put('/activateUser',(req,res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection(col_name).update(
        {_id:id},
        {
            $set:{
                isActive:true
            }
        },(err,result) => {
            if(err) throw err;
            res.send('User Activated')
        }
    )
})


MongoClient.connect(mongourl, { useUnifiedTopology: true },(err,connection) => {
    if(err) console.log(err);
    db = connection.db('node');
    app.listen(port,(err) => {
        console.log(`Server is running on port ${port}`)
    })
})
