const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const Project = require('../models/Project');

router.post('/', upload.single('spreadsheet'), async (req, res) => {
    try {
        const buffer = req.file.buffer; 
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        const data = XLSX.utils.sheet_to_json(worksheet);

        // Process and save to MongoDB
        for (const item of data) {
            const project = new Project({
                title: item["Project.Title"],
                technologies: item["Project.Technologies"],
                frontend: item["Technical_Skillset.Frontend"],
                backend: item["Technical_Skillset.Backend"],
                databases: item["Technical_Skillset.Databases"],
                infrastructure: item["Technical_Skillset.Infrastructure"]
            });

            await project.save();
        }

        res.status(200).send({ message: 'Data uploaded successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to process the file.' });
    }
});

module.exports = router;
