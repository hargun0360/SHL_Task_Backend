const express = require('express');
const router = express.Router();
const Project = require('../models/Project');


router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        if(projects.length == 0) {
            res.send("Please Upload the data");
        }else{
            res.json(projects);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;