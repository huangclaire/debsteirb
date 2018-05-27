const express = require('express');
const bodyParser= require('body-parser')
var URLSearchParams = require('url-search-params');
const MongoClient = require('mongodb').MongoClient
const app = express()
const url = 'mongodb://localhost:27017';
const bcrypt   = require('bcrypt-nodejs');
const ObjectID = require('mongodb').ObjectID
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.set('views', './views')
app.set('view engine', 'html')


///////////////////////////////FUNCTION DESCRIPTION :
// FORMAT OF THE TOKEN 

// Authorization : Bearer <access_token> 
//Verify Token
function verifyToken (req,res,next){
  //GET auth header value  --> send into rhe header
  const bearerHeader = req.headers['authorization']
  // check if bearer is undefined 
  if(typeof bearerHeader !== 'undefined'){
    // Split at the space ( split turns string into array  )
    const bearer= bearerHeader.split(' ') // indeed bearer is formed with an bearer and space and <acces_token> turn into an array to separeter bearer to the access
    // Get token from array 
    const bearerToken = bearer[1]
    //Set the token
    req.token =bearerToken;
    //Next middleware 
    next()
  }
  else{
    //Forbidden // can't acces screen forbidden 
    res.sendStatus(403)
  }
}

var CheckEmail=function (email){ //verifie si l'email envoye est bien dans la forme d'un email attendu return booleen 
  // expression regulière pr détecter les fausses @
  var regex1 =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (regex1.test(email)){
   return(true)
 }
 else{
  return(false)
}
}

const CheckExistFriendDbAdd= (req, res, next) => { //check if friend exist in DB 
  var cursor = db.collection('users').find({ email : req.body.add_friend}).toArray(function(err, results){
    if(results.length==0){
      console.log('friend not find')
      return res.status(400).json({ error: "Friend not find" })
    }
    else{  
      next() 
    }
  })

}
const CheckExistFriendDbDel= (req, res, next) => { //check if friend exist in DB 
  var cursor = db.collection('users').find({ email : req.body.delete_friend}).toArray(function(err, results){
    if(results.length==0){
      console.log('friend not find')
      return res.status(400).json({ error: "Friend not find" })
      console.log("erreur 400 exist friend")
    }
    else{ 
     console.log("pas erreurexist friend") 
     next() 
   }
 })

}

const CheckExistUserDb= (req, res, next) => { //check if user exist for signup
  var cursor = db.collection('users').find({ email : req.body.email}).toArray(function(err, results){
    if(results.length==0){ 
      next()
    }
    else{   
      console.log('User already exist')
      return res.status(400).json({ error: " User already exist " })
    }
  })
}

const CheckExistUserDbLogin= (req, res, next) => { //check if user exist for login
  var cursor = db.collection('users').find({ email : req.body.email}).toArray(function(err, results){
    if(results.length==0){ 
      return res.status(400).json({ error: " User doesnt exit" })
    }
    else{   
      console.log('User already exist')
      next()
    }
  })
}

const CheckExistUsernameDB= (req, res, next) => { //check if user exist for signup
  var cursor = db.collection('users').find({ email : req.body.username}).toArray(function(err, results){
    if(results.length==0){ 
      next()
    }
    else{   
      console.log('Username already exist')
      return res.status(400).json({ error: " User already exist " })
    }
  })
}


const CheckMutualFriendCred= (req,res,next )=>{ //on suppose que tous les users existe deja Cred
  var isFriend=false
  var cursor=db.collection('friends').findOne({ email : req.body.crediteur }, function(err, test){
    if(test.length==0 ){
      return res.status(400).json({ error: " Friend doesnt exit" })
      console.log("Pas d'ami")
    }
    else{
     tab_friend=test.friend
     for (let index in tab_friend) {
      if (tab_friend[index] === req.body.debiteur){
        isFriend=true
        break
      }
      else{
        isFriend=false
      }
    }
    if (isFriend){
     next()
   }
   else{
    return res.status(400).json({ error: " Friend doesnt exit" })
        //return res.status(400).json({ error: "Bad product parameters." })
      }
    }
  })
}

const CheckMutualFriendDeb= (req,res,next )=>{ //on suppose que tous les users existe deja Cred
  var isFriend=false
  var cursor=db.collection('friends').findOne({ email : req.body.debiteur }, function(err, test){
    if(test.length==0 ){
      return res.status(400).json({ error: " Friend doesnt exit" })
      console.log("Pas d'ami")
    }
    else{
     tab_friend=test.friend
     for (let index in tab_friend) {
      if (tab_friend[index] === req.body.crediteur){
        isFriend=true
        break
      }
      else{
        isFriend=false
      }
    }
    if (isFriend){
     next()
   }
   else{
    return res.status(400).json({ error: " Friend doesnt exit" })
        //return res.status(400).json({ error: "Bad product parameters." })
      }
    }
  })
}

app.post('/signup', CheckExistUserDb,CheckExistUsernameDB, function(req,res){ // récupère donnée pr mettre dans la Db // ATTENTION A VERIFIER QUE EMAIL UNIQUE

  if( req.body.password === req.body.cpassword && CheckEmail(req.body.email) === true ){ //vérifie que de 1 que le password est bien que le cpassword et que le mail est bien 
          bcrypt.genSalt(10, function(err, salt) { //bcript pr crypter le mdp
            bcrypt.hash(req.body.password, salt, null, function(err, hash) { //on hash notre mdp
              // Store hash in your password DB.
              var json = { username: req.body.username, email : req.body.email, password : hash, token: " ", photo: " "} 
              db.collection('users').save(json, (err, result) => { //on stocke dans la db le mdp (hashà crypte et l'email 
                if (err) return console.log(err)
                  console.log('Saved new users to database debsteirb in collection USERS')
              })
              var jsonfr={email: req.body.email, friend: []}
              db.collection('friends').save(jsonfr,(err_fr,resultsf) => {  
                if (err_fr) return console.log(err_fr)
                 console.log('Saved new users to database debsteirb in collection FRIEND with NO FRIEND')
             })
            })
          })
          res.json("Inscription Réussie!") //message de retour success
        }
        else{
   console.log('Mot de passe different ou @mail invalide') //si ca marche pas redirige vers la même page en indiquant que le mdp est different ou@mail invalide 
   res.status(404).json({error:"Signup Error"})
 }
})



app.post('/login',CheckExistUserDbLogin, function(req,res) { // il s'agit ici dans un premier temps de verifier si user existe te de comparer mdrp
  res.header("Access-Control-Allow-Origin","*")
  const user= {
    email: req.body.email,
    pass: req.body.password
  }
  var cursor = db.collection('users').find({ email : req.body.email}).toArray(function(err, results){
      psw_db=(JSON.parse(JSON.stringify(results[0]))).password //on transforme en JSON ( JSON.stringify) puis on parse (JSON.parse)
      photo=(JSON.parse(JSON.stringify(results[0]))).photo
      username=(JSON.parse(JSON.stringify(results[0]))).username
      bcrypt.compare(req.body.password, psw_db, function(err, result_b) { //on compare les deux mdp cripté
        if(result_b==true){
          console.log('nice u are now connected')
          // Token attribution 
          const user= {
            email: req.body.email,
            pass: psw_db
          }          
          jwt.sign({user: user},'secretkey',{expiresIn: '1d'},(err,token)=>{
            res.json({token: token, username: username, photo: photo})
            db.collection('users').update({ email: req.body.email }, { $set: { token: token } })
            .catch(err => console.log("Error " + err))

          })
        }
        else{
          res.status(404).json({error:'wrong, psw'})
        }
      })
    })
})


/////////////////PROFIL : ///////////////////////


// add a friend by updating the db 

app.post("/profil_add/:name",verifyToken,CheckExistFriendDbAdd,(req, res) => { // requete ici post car page web methode était post 
  //AUthentification
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.status(403).json({error: 'wrong token'});
    }
    else{
       var isFriend=false // bydefault it is false so we put unless it is true 
        var cursor=db.collection('friends').find({ email : req.params.name}).toArray(function(err, results){ // par du principe que si profil Existence du type dans db 
          var friend_tab=JSON.parse(JSON.stringify(results[0])).friend 
          for (let attr  in friend_tab) {
         if (friend_tab[attr] == req.body.add_friend){ //find in the db in array friend
          isFriend=true
        }
      }


      if(isFriend==false){

        db.collection('add_friends').find({demandeur: req.params.name, receveur: req.body.add_friend}).toArray(function(err,results){
          if (results.length!=0) {
            res.status(405).json({error: "Demande déjà effectuée"})
          }else{
            var json = { demandeur : req.params.name ,receveur : req.body.add_friend, etat : "1"} 
            db.collection('add_friends').save(json, (err, result) => { 
              if (err) return console.log(err)
                console.log('Saved new demande d ajout d ami to database debsteirb in collection add_friends')
              res.json("Demande prise en compte")
            })
          }
        })
      }
      else{
        res.status(404).json({error:"Déjà ami ou non existant"})
      }
    })
      }
    })
})

app.get('/profil/accept_fd/:name' ,verifyToken, function(req,res) { 


  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      //ACCEPTER LES DEMANDES D'AJOUT ENVOYEES PAR MES COPAINS
      db.collection('add_friends').find({ receveur : req.params.name}).toArray(function(err,results){
        console.log(results)
        if(results==null || results==undefined){
          res.status(200).json({results: [], length:0})
        }
        res.status(200).json({results: Array.from(results), length: Array.from(results).length});
      })
      console.log("fini")

    }

  })
  
})


app.post('/profil/accept_fd/:name',verifyToken,function(req,res){
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      //ACCEPTER UNE DEMANDE
      db.collection('add_friends').find({ _id : ObjectID(req.body.id)}).toArray(function(err,results){
        if(results[0].receveur==req.params.name){
          db.collection('friends').update({ email: req.params.name }, { $push: { friend: results[0].demandeur } })
          .catch(err => console.log("Error " + err))
          db.collection('friends').update({ email: results[0].demandeur }, { $push: { friend: req.params.name } })
          .catch(err => console.log("Error " + err))
          db.collection('add_friends').remove({_id : ObjectID(req.body.id)},1).catch(err => console.log("Error" + err))
          res.json("Vous êtes maintenant amis.")
        }
        else{
          res.sendStatus(404).json("Error this invitation doesnt concern you.")
        }

      })
      console.log("fini")

    }

  })

})

app.get('/profil/request_fd/:name' ,verifyToken, function(req,res) { 

  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{

      //j'affiche les requetes que j'ai deja envoyé pour pouvoir les supprimer 
      db.collection('add_friends').find({ demandeur : req.params.name}).toArray(function(err,results){
        if(results==null || results==undefined){
          res.status(200).json({results: [], length: 0});
        }
        res.status(200).json({results: Array.from(results), length: Array.from(results).length});

      })
      
    }
  })
})


app.delete('/profil/request_fd/:name',verifyToken,function(req,res){
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{

      //j'affiche les requetes que j'ai deja envoyé pour pouvoir les supprimer 
      db.collection('add_friends').remove({ _id:ObjectID(req.body.id), demandeur : req.params.name},1)
      .then(res.json("Suppression réussie!"))
      .catch(err => {
        console.log("Error"+err)
        res.status(404).json({error: "Error" + err})
      })
      
    }
  })

})

//delete profil 
app.delete("/profil_delete/:name",verifyToken,CheckExistFriendDbDel,(req, res) => { // requete ici post car page web methode était post 
  //AUthentification
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.status(403).json({error: 'wrong token'});
    }
    else{

      var isFriend=false
      var cursor=db.collection('friends').find({ email : req.params.name}).toArray(function(err, results){ // par du principe que si profil Existence du type dans db 
        var friend_tab=JSON.parse(JSON.stringify(results[0])).friend 

        for (let attr  in friend_tab) {
          if (friend_tab[attr] == req.body.delete_friend){
            isFriend=true
          }
        }

        if(isFriend==true){
          db.collection('friends').update({ email: req.params.name }, { $pull: { friend: req.body.delete_friend } }).catch(err => console.log("Error"+err))
          db.collection('friends').update({ email: req.body.delete_friend }, { $pull: { friend: req.params.name } }).catch(err => console.log("Error"+err))
          res.json("Ami supprimé")
        }
        else{
          res.status(404).json({error: "Delete friend erro: you are not friends"})
        }
      })
    }
  })
})

//Epargne 


app.post("/epargne",verifyToken,CheckMutualFriendCred,CheckMutualFriendDeb,function(req,res) {
 //epargne saved peut être un menu déroulant pour la description + debiteur que si ami peut etre sous forme de meu déroulant tambien 
//AUthentification
console.log("test epargne")
jwt.verify(req.token,'secretkey',(err,authData)=>{
  if(err){
    res.sendStatus(403);
  }
  else{
    var montant_test=false 
 //check if the amount is positive
 if((parseInt(String(req.body.montant))> 0) ==true ){
  montant_test=true
}
if(montant_test==true){
  var json_epargne = { createur: req.body.createur, email_crediteur: req.body.crediteur, email_debiteur: req.body.debiteur, start_date: req.body.date, description: req.body.description, etat: req.body.etat, montant: req.body.montant, close_id: "-",end_date:"-"  }
  db.collection('epargne').save(json_epargne,(err_epargne,results_epargne) => {  
    if (err_epargne){ return console.log(err_epargne)}
     console.log('Saved to DB Epargne')
      res.json("epargne created")
 })
}
else{
  console.log('not save ')
  res.status(404).json("epargne error")
}
}
})
})



app.get('/friends/:name',verifyToken, function(req,res) { 

  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      db.collection('friends').find({ email : req.params.name}).toArray(function(err, results){ 
        if(err){
          res.status(404).json("Error get friends")
        } else{
          var friend=results[0].friend;
          if(friend==null || friend==undefined){
            res.status(200).json({results: [], length:0})
          }else{
            res.status(200).json({results: Array.from(friend), length: Array.from(friend).length});
          }
        }
      })
    }
  })
})

 //get all the creance positif
 app.get("/epargne_creance/:name",verifyToken,function(req,res){

  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      db.collection('epargne').find({ email_crediteur : req.params.name}).toArray(function(err, results){
        if(err){
          res.status(404).json("Error get creance")
        }
        else{
          if(results==null || results==undefined){
            res.status(200).json({creance: [], length: 0});
          }else{
            res.status(200).json({creance: Array.from(results), length: Array.from(results).length});
          }
        }
      })
    }
  })
})

 app.get("/epargne_dette/:name",verifyToken,function(req,res){
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      db.collection('epargne').find({ email_debiteur : req.params.name}).toArray(function(err, dette){
        if(err){
          res.status(404).json("Error get dette")
        }
        else{
          if(dette==null || dette==undefined){
            res.status(200).json({dette: [], length: 0})
          }
          else{
            res.status(200).json({dette: Array.from(dette), length: Array.from(dette).length})
          }
        }
      })
    }
  })
})


 app.patch("/creance_accept",verifyToken,function(req,res){
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      db.collection('epargne').update({ _id: ObjectID(req.body.id) }, { $set: { etat : req.body.etat } } )
      .then(res.json("Acceptable prise en compte"))
      .catch(err => res.status(404).json("Creance/Dette not found"))
    }
  })

})

 app.patch("/creance_modification",verifyToken,function(req,res){
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      db.collection('epargne').update({ _id: ObjectID(req.body.id) }, { $set: { etat : "creation", montant: req.body.montant, description: req.body.description } } )
      .then(res.json("Modification prise en compte"))
      .catch(err => res.status(404).json("Creance/Dette not found"))
    }
  })

})



 app.patch('/photo/:name',verifyToken, function(req,res) { 

  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      db.collection('users').update({ email: req.params.name }, { $set: { photo: req.body.photo } })
      .then(res.json("Ajout photo réussie"))
      .catch(err => res.status(404).json("User not exist"))
    }
  })
})

 app.get('/photo/:name',verifyToken, function(req,res) { 

  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      db.collection('users').find({ email : req.params.name}).toArray(function(err, result){
        if(result==null || result==undefined){
          res.status(404).json("User not found")
        }
        res.status(200).json({photo: result[0].photo});
      })
    }
  })
})



 var db
 MongoClient.connect(url, (err, database) => {
  if (err) return console.log(err)
  db = database.db('debsteirb') // whatever your database name is
  db.createCollection("friends", function(err, res) { //database for friends according profil
    console.log("Collection friends created!")
  })
  db.createCollection("epargne", function(err, res) {
    console.log("Collection epargne created!")
  })
  db.createCollection("users", function(err, res) {
    console.log("Collection users created!")
  })
  db.createCollection("add_friends", function(err, res) {
    console.log("Collection add_friends created!")
  })
  
  app.listen(3333, function() {
    console.log('listening on 3333 ( srv )')
  })

})