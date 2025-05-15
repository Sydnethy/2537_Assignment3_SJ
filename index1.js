const express = require("express");
const app = express();
const port = process.env.PORT || 8888;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/styles"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());



app.use("/", (req, res) => {
    res.render("index");
});
app.use("/easy", (req, res) => {
    res.render("easy");
});
app.use("/medium", (req, res) => {
    res.render("medium");
});
app.use("/hard", (req, res) => {
    res.render("hard");
});







// Add the correct catch-all middleware
app.use((req, res) => {
    res.status(404);
    res.render("404");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});