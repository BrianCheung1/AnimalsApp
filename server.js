const express = require("express"); //Access the express package
const { MongoClient, ObjectId } = require("mongodb"); //Access the mongodb, objectID 
const multer = require("multer") //for users to send us files
const upload = multer()
const sanitizeHTML = require('sanitize-html') //cleans up string 
let db;

//creates an instance of app
const app = express();
//template for website
app.set("view engine", "ejs")
app.set("views", "./views")
app.use(express.static("public"))

//if browser sends json, we can easily access data
app.use(express.json())
//if user sent regular html form we can use that as well
app.use(express.urlencoded({extended: false}))

//our own middleware
//run this function before req and res for other routes
function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", "Basic realm='Our MERN App'")
  if(req.headers.authorization == "Basic YWRtaW46cGFzc3dvcmQ="){
    next()
  } else {
    console.log(req.headers.authorization)
    res.status(401).send("Try Again")
  }
}

//get request for home page
//first paramater is the path
//the second paramter is a function request/response
//request is the users request to the page
//response is the response given to the user
app.get("/", async (req, res) => {
  const allAnimals = await db.collection("animals").find().toArray();
  res.render("home", {allAnimals})
});

//use middleware for all routes after the homepage
app.use(passwordProtected)

//get request for admin page
//sends response for admin viewers only
app.get("/admin", (req, res) => {
  res.render("admin")
});

app.get("/api/animals", async (req, res) =>{
  const allAnimals = await db.collection("animals").find().toArray();
  res.json(allAnimals)
})

app.post("/create-animal", upload.single("photo"), ourCleanup, async (req, res) => {
  console.log(req.body)
  const info = await db.collection("animals").insertOne(req.cleanData) //info of the inserted document by user
  const newAnimal = await db.collection("animals").findOne({_id: new ObjectId(info.insertedId)}) //search the collection using the info id created by the inserted document
  res.send(newAnimal)
})

//Cleans up user input and data before uploading to our database
//we only want simple strings rather than objects/html
function ourCleanup(req, res, next){
  if (typeof req.body.name !="string") req.body.name = ""
  if (typeof req.body.species !="string") req.body.species = ""
  if (typeof req.body._id !="string") req.body._id = ""

  req.cleanData = {
    name: sanitizeHTML(req.body.name.trim(), {allowedTags: [], allowedAttributes: {}}), //empty tags and empty attributes because none are allowed
    species: sanitizeHTML(req.body.species.trim(), {allowedTags: [], allowedAttributes: {}}) //empty tags and empty attributes because none are allowed

  }
  next()
}

//connect to database
async function start() {
  const client = new MongoClient(
    "mongodb://root:root@localhost:27017/AmazinigMernApp?&authSource=admin"
  );
  //wait for connection to mongodb
  await client.connect();
  //returns the database
  db = client.db();
  //port for app instance to connect to
  app.listen(3000);
}
start();
