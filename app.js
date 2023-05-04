require('dotenv').config()
const express = require(`express`);
const bodyParser = require(`body-parser`);
const ejs = require(`ejs`);
const mongoose = require(`mongoose`);
const encrypt = require(`mongoose-encryption`);

const app = express();

console.log(process.env.API_KEY);
app.use(express.static(`public`));
app.set(`view engine`, 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/sDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// encryption part

userSchema.plugin(encrypt, { secret: process.env.SECRTE,  encryptedFields: ['password'] });

const User = new mongoose.model(`User`, userSchema);


app.get(`/`,function(req, res){
    res.render(`home`);
});

app.get(`/login`,function(req,res){
    res.render(`login`);
});

app.get(`/register`, function(req,res){
    res.render(`register`);
});


app.post(`/register`, function(req,res){
    const newUser = new User({
        email: req.body.username,
        password : req.body.password
    });

    newUser.save()
    .then(() => { //this is a callback functions in other way insted of if else
        res.render(`secrets`);
    })
    .catch((err) => {
        console.log(err);
    })
});


app.post(`/login`, function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username})
    .catch((err) => { //in the catch block show the always errores
        res.send(400, "Bad Request");
    })
    .then((foundUser) =>{ /// in the then block main logic
        if(foundUser){
            if (foundUser.password === password){
                res.render(`secrets`);
            }
        }
    })
});



app.listen(80,function(){
    console.log(`server are running on port 80`);
});
