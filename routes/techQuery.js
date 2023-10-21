const express = require('express');
const router = express.Router();
const client = require('../config/apiClient');  

router.get('/', async (req, res) => {

    const promptString = `Given the body query: ${req.query?.question}.
    You are required to extract keywords that pertain specifically to tech stacks, such as programming languages, tools, frameworks, platforms, etc.
    Your objective is to categorize and segregate these keywords into an object with the following properties:
    frontend_technologies
    backend_technologies
    databases
    infrastructure (only include technologies under this category if the body query explicitly mentions them as infrastructure-related)
    The values for each of these properties should be an array of strings, containing only the tech-related terms that correspond to their respective categories. Ensure to only focus on the explicitly mentioned tech-related terms in the body query and avoid making any assumptions or considering general terms.
    Return your findings in JSON format.`;


 await   client.generateText({
        model: 'models/text-bison-001',
        temperature: 0.5,
        candidateCount: 3,
        top_k: 40,
        top_p: 0.95,
        max_output_tokens: 1024,
        stop_sequences: [],
        prompt: {
            text: promptString,
        },
    }).then(result => {
        let responseSent = false;
        
        for (let i = 0; i < result.length && !responseSent; i++) {
            const d1 = result[i];
            if (d1) {
                for (let j = 0; j < d1.candidates.length && !responseSent; j++) {
                    const d2 = d1.candidates[j];
                    const rawOutput = d2.output;

                    try {
                        const jsonString = rawOutput.match(/\{(.|\n)*\}/g)[0];
                        const jsonObject = JSON.parse(jsonString);
                        res.json(jsonObject);
                        responseSent = true;
                    } catch (error) {
                        console.error("Error parsing the AI response:", error);
                    }
                }
            }
        }

        if (!responseSent) {
            res.status(500).send("Could not extract valid data from the AI response");
        }
    });
});

module.exports = router;
