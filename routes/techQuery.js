const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
require("dotenv").config();

const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");
const API_KEY = process.env.API_KEY;
const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

router.get("/", async (req, res) => {
  const promptString = `Given the body query: ${req.query?.question}.
  Extract and categorize technology-related keywords from the given input query.

  Input:
  A Body query string, for example: "Find projects using React, Node, and MongoDB but not Python or Django."
  
  Output Requirements:
  Return a structured JSON response that categorizes the mentioned technology-related terms based on their respective categories.
  
  Categories:
  
  technologies: General tech-related terms.
  frontend_technologies: Technologies specifically related to frontend development.
  backend_technologies: Technologies specifically related to backend development.
  databases: Technologies pertaining to databases.
  infrastructure: Only include technologies under this category if the query explicitly mentions them as infrastructure-related.
  Output Structure:
  Each category should have two sub-properties:
  
  needed: An array of strings containing the tech-related terms that are required.
  not_needed: An array of strings containing the tech-related terms that are not required or should be excluded.
  Example Input:
  "Find projects using React, Node, and MongoDB but not Python or Django."
  
  Example Output:
  {
    "technologies": {
        "needed": ["React", "Node", "MongoDB"],
        "not_needed": ["Python", "Django"]
    },
    "frontend_technologies": {
        "needed": ["React"],
        "not_needed": []
    },
    "backend_technologies": {
        "needed": ["Node"],
        "not_needed": ["Python", "Django"]
    },
    "databases": {
        "needed": ["MongoDB"],
        "not_needed": []
    },
    "infrastructure": {
        "needed": [],
        "not_needed": []
    }
}

Note:
Avoid making assumptions or considering general terms that aren't directly tech-related. Ensure that the extraction is based solely on the explicitly mentioned tech-related terms in the input query.
  `;

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
            const aiResponse = jsonObject;
            console.log("AI-Response: " + JSON.stringify(aiResponse));

            try {
              let query = {};

              // If technologies.needed is not empty, then add it to the query
              if (aiResponse.technologies.needed.length > 0) {
                query["Technologies"] = {
                  ...query["Technologies"],
                  $all: aiResponse.technologies.needed,
                };
              }

              // If technologies.not_needed is not empty, then add it to the query
              if (aiResponse.technologies.not_needed.length > 0) {
                query["Technologies"] = {
                  ...query["Technologies"],
                  $nin: aiResponse.technologies.not_needed,
                };
              }

              // For frontend technologies
              if (aiResponse.frontend_technologies.needed.length > 0) {
                query["Frontend"] = {
                  ...query["Frontend"],
                  $all: aiResponse.frontend_technologies.needed,
                };
              }

              if (aiResponse.frontend_technologies.not_needed.length > 0) {
                query["Frontend"] = {
                  ...query["Frontend"],
                  $nin: aiResponse.frontend_technologies.not_needed,
                };
              }

              // For backend technologies
              if (aiResponse.backend_technologies.needed.length > 0) {
                query["Backend"] = {
                  ...query["Backend"],
                  $all: aiResponse.backend_technologies.needed,
                };
              }

              if (aiResponse.backend_technologies.not_needed.length > 0) {
                query["Backend"] = {
                  ...query["Backend"],
                  $nin: aiResponse.backend_technologies.not_needed,
                };
              }

              // For databases
              if (aiResponse.databases.needed.length > 0) {
                query["Databases"] = {
                  ...query["Databases"],
                  $all: aiResponse.databases.needed,
                };
              }

              if (aiResponse.databases.not_needed.length > 0) {
                query["Databases"] = {
                  ...query["Databases"],
                  $nin: aiResponse.databases.not_needed,
                };
              }

              // For infrastructure
              if (aiResponse.infrastructure.needed.length > 0) {
                query["Infrastructure"] = {
                  ...query["Infrastructure"],
                  $all: aiResponse.infrastructure.needed,
                };
              }

              if (aiResponse.infrastructure.not_needed.length > 0) {
                query["Infrastructure"] = {
                  ...query["Infrastructure"],
                  $nin: aiResponse.infrastructure.not_needed,
                };
              }

              const projects = await Project.find(query).lean();

              console.log(projects);
              res.json(projects);
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
