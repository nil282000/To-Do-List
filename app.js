//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connecting to Mongoose and creating a database
mongoose.connect("mongodb+srv://admin-ayush:1234@cluster0.gs55b.mongodb.net/toDoListDB?retryWrites=true&w=majority", {useNewUrlParser: true});

// Creating Schema
const itemsSchema = {
  name :String
};

// Creating Collection from the Schema
const Item = mongoose.model("Item", itemsSchema);

// Creating Items for the ToDoList
const item1 = new Item({
  name: "Welcome to toDoList!"
});

const item2 = new Item({
  name: "Hit + to add new Item"
});

const item3 = new Item({
  name: "<-- to delete an item"
});


// Creating a Defaut Array
const defautItems = [item1, item2, item3];

const listSchema = {
  name: String,
  listItems: [itemsSchema]
};

// Model for list Schema
const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
    Item.find({}, function(err, foundItems) {
      if(foundItems.length===0) {
        Item.insertMany(defautItems, function(err){
          if(err) {
            console.log(err);
          } else {
            console.log("Successfully Added!");
          }
        })
        res.redirect("/")
      }else {
        res.render("list", {listTitle: "Today", newListItems:foundItems})
      }
    })
  });


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName==="Today") {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name: listName}, function(err, found) {
      found.listItems.push(item);
      found.save();
      res.redirect("/" + listName)
    })
  }



});

// Creating custom url for the dynamic lists
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, results) {
    if(!err) {
      if(!results) {
        // Create a new List
        const list = new List({
          name : customListName,
          listItems: defautItems
        });

        list.save();
        res.redirect("/" + customListName)

      }else {
        // show an existing list
        res.render("List", {listTitle: results.name, newListItems: results.listItems})
      }
    }
  })

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(!err) {
        console.log("Successfully Deleted!");
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {listItems: {_id: checkedItemId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/"+listName)
      }
    })
  }



})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server has started Successfully!");
});
