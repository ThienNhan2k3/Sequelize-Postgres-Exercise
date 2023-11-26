const controller = {};
let models = require("../models");
const sequelize = require("sequelize");
const Op = sequelize.Op;


controller.showList = async (req, res) => {
    const blogsPerPage = 2;
    const {category, tag} = req.query;
    const minPage = 1;
    const page = isNaN(req.query.page) ? minPage : parseInt(req.query.page);
    const keyword = req.query.keyword || '';
    res.locals.categories = await models.Category.findAll({
        include: [
            {model: models.Blog}
        ]
    })
    res.locals.tags = await models.Tag.findAll();
    
    const options = {
        attributes: ["id", "title", "createdAt", "imagePath", "summary"],
        include: [
            {model: models.Comment}
        ],
    }

    if (!isNaN(category)) {
        options.include = [{
            model: models.Category,
            where: { id: parseInt(category)}    
        }]
    }
    if (!isNaN(tag)) {
        options.include = [{
            model: models.Tag,
            where: {id: parseInt(tag)}
        }]
    }
    if (keyword.trim() !== '') {
        options.where = {
            title: {
                [Op.iLike]: `%${keyword}%`
            }
        }
    }
    let blogs = await models.Blog.findAll(options);

    if (!isNaN(page)) {
        const maxPage = Math.ceil(blogs.length * 1.0 / blogsPerPage);
        if (page > maxPage || page < minPage) {
            return res.send("Page not found!!!");
        }
        res.locals.pagination = {
            minPage,
            previousPage: page - 1,
            isValidPreviousPage: page - 1 >= minPage,
            currentPage: page,
            nextPage: (page + 1 > maxPage) ? maxPage : page + 1,
            isValidNextPage: page + 1 <= maxPage,
            maxPage,
        }
        const startIndexBlogs = (page - 1) * blogsPerPage
        blogs = blogs.slice(startIndexBlogs, startIndexBlogs + blogsPerPage);
    }

    res.locals.blogs = blogs;
    res.locals.url = req.url.slice(1);
    return res.render("index");
}

controller.showDetails = async (req, res) => {
    const id = req.params.id ? parseInt(req.params.id) : 0;
    res.locals.blog = await models.Blog.findOne({
        attributes: ["id", "title", "description", "createdAt"],
        where: {id},
        include: [
            {model: models.Category},
            {model: models.User},
            {model: models.Tag},   
            {model: models.Comment},   
        ]
    });

    res.locals.categories = [res.locals.blog.Category];
    res.locals.tags = [...res.locals.blog.Tags];
    res.locals.url = req.url.slice(1);
    console.log(res.locals.url);
    return res.render("details");
}

module.exports = controller;