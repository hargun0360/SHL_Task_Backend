const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    Title: String,
    Technologies: [String],   // Array of strings
    Frontend: [String],       // Array of strings
    Backend: [String],        // Array of strings
    Databases: [String],      // Array of strings
    Infrastructure: [String], // Array of strings
    Availability: String
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
