//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
  //  te12


mongoose.connect("mongodb+srv://admin-mercy:te12@cluster0.d71be.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

 const itemsSchema = {
  name : String
 }; 

 const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name : "Welcome"
});
const  item2 = new Item ({
  name : "+ button"
});
const  item3 = new Item ({
  name : "<-- Hit"
});



const defaultItems = [item1,item2,item3];

   
const listSchema = {
name : String,
items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);




 
app.get("/", function(req, res) {

Item.find({}).then(foundItems => { 
  if (foundItems.length == 0){ 

    Item.insertMany(defaultItems).then(function(err){
      console.log("Successfully saved defult items to DB");
    }).catch(function (err) {
      console.log(err);
    });
    res.redirect("/;")
  } else{

    res.render("list", {listTitle: "Today" , newListItems: foundItems});

  } 


})
 .catch(err=> {console.error('there was an error', err)}) ;
});
  



app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save().then(() => res.redirect("/" + customListName));
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(err => {
      console.error("There was an error", err);
      res.status(500).send("Internal Server Error"); // Handle errors properly
    });
});   

 
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.list; // This is correctly defined
  
  const item = new Item({
    name: itemName
  });

  if (listTitle === "Today") { // Use listTitle instead of listName
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listTitle }).then(foundList => { // Use listTitle here as well
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    }).catch(err => console.log(err)); // Handle potential errors
  }
});

  app.post("/delete", async (req, res) => {
    const listName = req.body.listName; // Extract list name from request body
    const checkedItemId = req.body.checkbox; // Extract the item ID
  
    if (listName === "Today") { 
      try { 
        const deletedItem = await Item.findByIdAndDelete(checkedItemId);
        console.log("successsssssssssss", deletedItem);
        res.redirect("/");
      } catch (err) {
        console.log(err);
      } 
    } else {
      try {
        await List.findOneAndUpdate(
          { name: listName }, 
          { $pull: { items: { _id: checkedItemId } } }
        );
        res.redirect("/" + listName);
      } catch (err) {
        console.log(err);
      }
    }
  });
  



app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});


// api key5f492e5a-04cb-4498-bea1-da94cc5aa09b
// public key fuofotio