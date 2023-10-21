const express = require("express");
const XLSX = require("xlsx");
const router = express.Router();
const upload = require("../middlewares/upload");
const Project = require("../models/Project");

const parseXLSX = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    return XLSX.utils.sheet_to_json(worksheet);
};

const transformData = (data) => {
    return data.map(entry => {
        return {
          
                Title: entry["Project.Title"] || "",
                Technologies: entry["Project.Technologies"] ? entry["Project.Technologies"].split(",").map(item => item.trim()) : [],
                Frontend: entry["Technical_Skillset.Frontend"] ? entry["Technical_Skillset.Frontend"].split(",").map(item => item.trim()) : [],
                Backend: entry["Technical_Skillset.Backend"] ? entry["Technical_Skillset.Backend"].split(",").map(item => item.trim()) : [],
                Databases: entry["Technical_Skillset.Databases"] ? entry["Technical_Skillset.Databases"].split(",").map(item => item.trim()) : [],
                Infrastructure: entry["Technical_Skillset.Infrastructure"] ? entry["Technical_Skillset.Infrastructure"].split(",").map(item => item.trim()) : [],
                Availability: entry["Other_Information.Availability"] || "",
            }
    });
}


router.post("/", upload.single("file"), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).send({ error: "No files uploaded." });
      }
      const rawData = parseXLSX(req.file.buffer);
      const structuredData = transformData(rawData);
  
      // Process and save to MongoDB
      await Project.insertMany(structuredData);
  
      res.status(200).send({ message: "Data added successfully!" });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send({ error: "Failed to process the file." });
    }
  });
  
  module.exports = router;