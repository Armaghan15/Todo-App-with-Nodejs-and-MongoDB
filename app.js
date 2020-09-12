const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();



// Using ejs as our view engine
app.set('view engine', 'ejs');

// Using body-parser to grab the data from the front-end
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// Creating a new database named ToDoListDB in mongoDB with mongoose
mongoose.connect("mongodb://localhost:27017/ToDoListDB", { useNewUrlParser: true });


// Creating a Schema for tasks that the user adds
const taskSchema = new mongoose.Schema({
    title: String,
});


// Creating a Task model with the taskSchema
const Task = mongoose.model("Task", taskSchema);


// Creating a schema for custom lists requests
const newListSchema = new mongoose.Schema({
    name: String,
    tasks: [taskSchema]
});

// Creating a List model with the newListSchema
const List = mongoose.model("List", newListSchema);



const Do_stuff = new Task({
    title: "This is your ToDo list!",
});


const tasks = [Do_stuff];



// ----------------(First Method)----------------

// method for displaying the list of tasks in the todo lists
app.get('/', function(req, res){

    // Finding all the tasks from the Task model and then rendering them
    Task.find({}, function(err, foundItems){

        // If there are no items in the tasks Array, insert the given items
        if (foundItems.length === 0){
            Task.insertMany(tasks, function(err){
                
                if (err){
                    console.log(err);
                }else{
                    console.log("Successfully saved tasks to the Data Base!");
                }
                res.redirect("/");
            }); 

        }else{
            res.render("list", {
                listTitle: "Today",
                tasks: foundItems
            });
        }
    });
});



// ----------------(Another Method Starting)----------------

// Post method for handling the post requests from the templete
app.post("/", function(req, res){

    // Grabbing the new task submites from the template form
    const taskName = req.body.newTask;
    const listName = req.body.list;

    // Creating a new task with taskName
    const newTask = new Task({
        title: taskName,
    })

    // Adding new tasks to the list depending on their names
    if (listName === "Today"){
        // Add newTask to the default list
        newTask.save();
        res.redirect("/");
    } else{
        // Add newTask to the list with the given name
        List.findOne({name: listName}, function(err, foundList){
            foundList.tasks.push(newTask);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});


// ----------------(Another Method Starting)----------------

// Post Method for deleting a Task
app.post("/deleteTask", function(req, res){

    // Grabbing the Id of the checked Item
    const itemId = req.body.checkbox;

    // Gradding the name of the list in which the Item is!
    const listName = req.body.listName;


    if (listName === "Today"){
        // Deleting the checked Item by it's id from the default list
        Task.findByIdAndRemove(itemId, function(err){
            if (!err){
               console.log("Successfully Deleted the checked Item!");
               res.redirect("/")
            }
        });
    } else {
        // Deleting the checked item from the given list by it's id
        List.findOneAndUpdate({name: listName}, {$pull: {tasks: {_id: itemId}}}, function(err, foundList){
            if (!err){
                res.redirect("/" + listName);
            }
        });
    }
});



// ----------------(Another Method Starting)----------------

// Get method for a new work list 
app.get("/:customRequestedList", function(req, res){

    // Grabbing the customRequestedList that the user requests and storing it in requestedListName
    const requestedListName = _.capitalize(req.params.customRequestedList);

    // Function for checking if a custom list with the given name exists, if it does, the function will render it, if Notification, it will create one with the given name
    List.findOne({name: requestedListName}, function(err, foundList){
        if (!err){
            if(!foundList){
                // Create a new List
                const list = new List({
                    name: requestedListName,
                    tasks: tasks,
                });
                list.save();

                res.redirect("/" + requestedListName);

            } else{
                // Show the list
                res.render("list", {
                    listTitle: requestedListName,
                    tasks: foundList.tasks,
                });
            }
        }
    })
});


// ----------------(Another Method Starting)----------------

// Method for handling post requests for work list 
app.post("/work", function(res, req){
    // Grab the item from the front-end form
    let task = req.body.newTask;

    // Push the item to workItems list above
    workItems.push[task];

    res.redirect("/work");

});




app.listen(3000, function(){
    console.log("Server Running on Port 3000");
});
