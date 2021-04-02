//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Hello!"
});

const item2 = new Item({
  name: "It's a nice day"
});

const item3 = new Item({
  name: "What do you wish to do?"
});

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
  
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
      });
    }; 
    if(!err){
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post('/delete', function(req, res){
  const checkedItem = req.body.checked;
  
  Item.findByIdAndRemove(checkedItem, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Successfully deleted.");
    }
    res.redirect('/')
  }
  )
});

const  listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get('/:newList', function(req, res){
  const newTodoList = req.params.newList
  
  List.findOne({name: newTodoList}, function(err, results){
    if(!err){
      if(!results){
        const list = new List({
          name: newTodoList,
          items: defaultItems
        });
        
        list.save();

        res.redirect('/' + newTodoList)
      } else {
        res.render('list', {listTitle: results.name, newListItems: results.items })
      }
    }
    })
  })
  
  
  app.post("/", function(req, res){ 

  const itemName = req.body.newItem;
  const listName = req.body.list

  item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect('/');
  } else {
    List.findOne(({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName)
    }))
  }


});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
