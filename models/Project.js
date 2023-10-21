const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: String,
    technologies: String,
    frontend: String,
    backend: String,
    databases: String,
    infrastructure: String
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
