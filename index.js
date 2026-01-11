const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const STACKS_FILE = 'stacks.json';

const loadStacks = () => {
    try {
        const data = fs.readFileSync(STACKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading stacks.json:', error);
        return {};
    }
};

const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        console.log(`Executing: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject({ error: error.message, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
};

app.post('/deploy', async (req, res) => {
    if (!req.body) {
        return res.status(400).send('Request body is required');
    }
    const { stack: stackName } = req.body;
    const authHeader = req.headers['authorization'];

    if (!stackName) {
        return res.status(400).send('Stack name is required');
    }

    const stacks = loadStacks();
    const config = stacks[stackName];

    if (!config) {
        return res.status(404).send('Stack configuration not found');
    }

    if (authHeader !== config.token) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const results = [];
        
        // 1. Pull images (optional, based on requirement "container names in stack" 
        // maybe we should just do docker compose pull or individual pulls)
        // Given the previous requirement had /pull, let's assume we want to pull images or just up.
        // If "container names" are provided, maybe we pull those specific ones.
        // However, usually docker compose up --build or docker compose pull is enough.
        
        if (config.stackPath) {
            console.log(`Deploying stack: ${stackName}`);
            
            const paths = Array.isArray(config.stackPath) ? config.stackPath : [config.stackPath];
            const fileArgs = paths.map(path => `-f ${path}`).join(' ');

            const pullResult = await executeCommand(`docker compose ${fileArgs} pull`);
            results.push({ step: 'pull', ...pullResult });
            
            const upResult = await executeCommand(`docker compose ${fileArgs} up -d --remove-orphans`);
            results.push({ step: 'up', ...upResult });
        } else {
             return res.status(400).send('stackPath is missing for this stack');
        }

        res.json({ message: 'Deployment successful', results });
    } catch (error) {
        res.status(500).json({ message: 'Deployment failed', error });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
