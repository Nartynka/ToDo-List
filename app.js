//jeśli mniej niż 5 "przypadków" to używać if else a jeśli więcej to używać switch

const express = require("express");
const bodyParser = require("body-parser");
// const ejs = require("ejs");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true });

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


const TaskSchema = new mongoose.Schema({
   task: {
      type: String,
      require: true
   }
});

const Task = new mongoose.model("task", TaskSchema);
const task1 = new Task({
   task: "Welcome to your ToDoList!"
});
const task2 = new Task({
   task: "Hit '+' to add new task"
});
const task3 = new Task({
   task: "<-- click to delete task"
});

const defaultTask = [task1, task2, task3];

// Task.insertMany([task1, task2, task3], function(err) { if (err) console.log(err); })


// custom lists

const ListSchema = new mongoose.Schema({
   name: String,
   items: [TaskSchema]
});


const List = new mongoose.model("list", ListSchema);


app.get("/", (req, res) => {
   // console.log(day);

   const day = date.getDate();
   Task.find(function(err, tasks) {
      if (err) console.log(err);
      if (tasks.length === 0) {
         Task.insertMany(defaultTask, function(err) { if (err) console.log(err); else console.log("succes!"); });
         res.redirect("/");
      } else {
         res.render("list-template", {
            listTitle: day,
            newItems: tasks
         });
      }
   });
});

app.post("/", (req, res) => {
   const item = req.body.newTask;
   const list = req.body.list;
   const task = new Task({
      task: item
   });
   if (list === date.getDate()) {
      task.save();
      res.redirect("/");
   } else { //post from custom list
      List.findOne({ name: list }, function(err, foundList) {
         if (!err) {
            foundList.items.push(task);
            foundList.save();
            res.redirect(`/${foundList.name}`);
         }
      })
   }
});

app.post("/delete", (req, res) => {
   // console.log(req.body);
   // console.log(req.body.checkbox);
   const taskId = req.body.checkbox;
   const listTitle = req.body.listTitle;
   // console.log(req.body);
   if (listTitle === date.getDate()) {
      Task.findByIdAndRemove(taskId, function(err) {
         if (err) console.log(err);
      });
      res.redirect("/");
   } else {//custom list
      List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: taskId}}}, function(err, foundList) {
         if(!err) res.redirect(`/${listTitle}`);
      });
   }
})



app.get("/about", (req, res) => {
   res.render("about");
});


// custom lists

app.get("/:name", (req, res) => {
   const name = _.capitalize(req.params.name);
   if (name === "Delete" || name === "Favicon.ico") { return 0 };
   console.log(name);

   List.findOne({ name: name }, function(err, result) {
      if (!err) {
         if (!result) {
            console.log("ni ma");
            const list = new List({
               name: name,
               items: defaultTask
            });
            list.save();
            res.redirect(`/${name}`);
         }
         else {
            console.log("jest");
            res.render("list-template", {
               listTitle: result.name,
               newItems: result.items
            });
         }
         // console.log(err);
         // console.log(result[0].name);
         // res.render("list-template", {
         //    listTitle: name,
         //    newItems: ["dziala"]
         // });
         // console.log("git");
         // return 0;
      }
   })

   // console.log(xd._conditions.name);

   // const list = new List({
   //    name: name,
   //    items: defaultTask
   // });
   // list.save();

   // res.render("list-template", {
   //    listTitle: name,
   //    newItems: defaultTask
   // }
   // );
})


// const checkbox = document.querySelectorAll(".checkbox");
// checkbox.forEach(e => {
//    if(e.checked === true) {
//       console.log("do usunięcia");
//    }
// });



// mongoose.connection.close();
app.listen(2137, () => console.log("Server is running on port 2137"));