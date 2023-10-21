const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
require("dotenv").config();
// const client = require('../config/apiClient');

const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");
const API_KEY = process.env.API_KEY;
const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

router.get("/", async (req, res) => {
  const promptString = `Given the body query: ${req.query?.question}.
    You are required to extract keywords that pertain specifically to tech stacks, such as programming languages, tools, frameworks, platforms, etc.
    Your objective is to categorize and segregate these keywords into an object with the following properties:
    technologies
    frontend_technologies
    backend_technologies
    databases
    infrastructure (only include technologies under this category if the body query explicitly mentions them as infrastructure-related)
    The values for each of these properties should be an array of strings, containing only the tech-related terms that correspond to their respective categories. Ensure to only focus on the explicitly mentioned tech-related terms in the body query and avoid making any assumptions or considering general terms.
    Return your findings in JSON format.`;

  await client
    .generateText({
      model: "models/text-bison-001",
      temperature: 0.5,
      candidateCount: 3,
      top_k: 40,
      top_p: 0.95,
      max_output_tokens: 1024,
      stop_sequences: [],
      prompt: {
        text: promptString,
      },
    })
    .then(async (result) => {
      let responseSent = false;

      for (let i = 0; i < result.length && !responseSent; i++) {
        const d1 = result[i];
        if (d1) {
          for (let j = 0; j < d1.candidates.length && !responseSent; j++) {
            const d2 = d1.candidates[j];
            const rawOutput = d2.output;
            const jsonString = rawOutput.match(/\{(.|\n)*\}/g)[0];
            const jsonObject = JSON.parse(jsonString);
            console.log("JSON object : " + JSON.stringify(jsonObject));
            const aiResponse = jsonObject;
            console.log("AI-Response: " + JSON.stringify(aiResponse));

            const query = {
              $or: [
                { Technologies: { $in: aiResponse.technologies } },
                { Frontend: { $in: aiResponse.frontend_technologies } },
                { Backend: { $in: aiResponse.backend_technologies } },
                { Databases: { $in: aiResponse.databases } },
                { Infrastructure: { $in: aiResponse.infrastructure } },
              ],
            };

            

            console.log("Query :", JSON.stringify(query));

            try {
              const projects = await Project.find({ Technologies: { $all: ['React']} , 
              Databases : { $all: ['SQL'] } , Backend : { $nin: ['Node'] }});
              console.log("First project from DB:", projects);

              const matchingProjects = projects.filter((project) => {
                console.log("Hello");
                let count = 0;

                console.log(project);

                // Check Technologies field
                if (
                  project.Technologies.some((tech) =>
                    aiResponse.technologies
                      .map((t) => t.toLowerCase().trim())
                      .includes(tech.toLowerCase().trim())
                  )
                )
                  count++;

                // Check Frontend field
                if (
                  project.Frontend.some((tech) =>
                    aiResponse.frontend_technologies
                      .map((t) => t.toLowerCase().trim())
                      .includes(tech.toLowerCase().trim())
                  )
                )
                  count++;

                // Check Backend field
                if (
                  project.Backend &&
                  project.Backend.some((tech) =>
                    aiResponse.backend_technologies
                      .map((t) => t.toLowerCase().trim())
                      .includes(tech.toLowerCase().trim())
                  )
                )
                  count++;

                // Check Databases field
                if (
                  project.Databases &&
                  project.Databases.some((tech) =>
                    aiResponse.databases
                      .map((t) => t.toLowerCase().trim())
                      .includes(tech.toLowerCase().trim())
                  )
                )
                  count++;

                // Check Infrastructure field
                if (
                  project.Infrastructure &&
                  project.Infrastructure.some((tech) =>
                    aiResponse.infrastructure
                      .map((t) => t.toLowerCase().trim())
                      .includes(tech.toLowerCase().trim())
                  )
                )
                  count++;

                return count >= 1;
              });
              console.log("Matching Projects", matchingProjects);
              res.json(matchingProjects);
              responseSent = true;
              return; // Exit the loop after sending response
            } catch (error) {
              res.status(500).send("Error fetching projects from the database");
              return; // Exit the loop after sending error response
            }
          }
        }
      }
      if (!responseSent) {
        res
          .status(500)
          .send("Could not extract valid data from the AI response");
      }
    })
    .catch((error) => {
      if (!res.headersSent) {
        res.status(500).send("Unexpected error occurred");
      }
    });
});

module.exports = router;
