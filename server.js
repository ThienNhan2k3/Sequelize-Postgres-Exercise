const express = require("express");
const app = express();
const handlebars = require("express-handlebars");

const PORT = 5000 || process.env.PORT;

app.use(express.static(__dirname + "/html"));

app.engine('hbs', handlebars.engine({
    extname: 'hbs',
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    },
    helpers: {
        showDate: (date) => {
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: 'long',
                day: "numeric"
            });
        },
        addQueryStringToUrl: (url, key, value) => {
            console.log(url);
            const index = url.indexOf(key);
            if (index === -1) {
                url += (url.indexOf("?") === -1) ? `?${key}=${value}` : `&${key}=${value}`;
            } else {
                let endIndex = url.length;
                for (let i = index; i < url.length; i++) {
                    if (url[i] === "&") {
                        endIndex = i;
                        break;
                    }
                }
                url = url.substring(0, index) + `${key}=${value}` + url.substring(endIndex);
            }
            return url;
        }
    }
}));
app.set("view engine", 'hbs')

app.get('/', (req, res) => {
    res.redirect("/blogs");
})

app.use("/blogs", require("./routes/blogRouter"));

app.get("/createTables", (req, res) => {
    let models = require("./models");
    models.sequelize.sync()
    .then(() => {
        res.send("Table create!");
    });
})

app.listen(PORT, () => {
    console.log("Server is running on PORT ", PORT);
})