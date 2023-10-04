const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const uri = process.env.MONGODB_URI;
dbname = "escapeRoom";
let db;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server    (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db(dbname).command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    db = client.db(dbname)
    startServer();
  } catch (error) {
      console.dir(error);
  }
}
run();
const bodyParser = require('body-parser');
const cors = require('cors');



// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { ObjectId } = require('mongodb');

// Serve static files
app.use(express.static('public'));
let teams = {};
// Routes
function startServer(){
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });
    
    app.post('/start', (req, res) => {
        const teamName = req.body.teamName;
        
        if (!teamName) {
            return res.status(400).json({ success: false, message: 'Team name is required' });
        }
        
        // Create a new document for the team with initial progress
        const team = { name: teamName, progress: 0 };
        if (!db) {
            return res.status(500).json({ success: false, message: 'Database not connected' });
        }
        db.collection('teams').insertOne(team)
        .then(result => {
            console.log(result);
            res.json({ success: true, teamId: result.insertedId }); // Send back the ObjectId as the teamId
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
    });
    
    app.get('/leaderboard', (req, res) => {
        if (!db) {
            return res.status(500).json({ success: false, message: 'Database not connected' });
        }
        db.collection('teams').find().sort({ progress: -1 }).toArray()
        .then(teams => {
            res.json({ success: true, teams: teams });
        })
        .catch(error => {
            console.error('Error retrieving leaderboard:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
    });
    
    app.post('/submit-answer', (req, res) => {
            console.log('Request body:', req.body); // Log incoming request body
            
            const teamId = req.body.teamId;
            const answer = req.body.answer;
            const page = req.body.page;

            if (!teamId || !answer || (page !== 0 && !page)) {
                console.error('Missing or invalid data:', { teamId, answer, page }); // Log error for missing or invalid data
                return res.status(400).json({ success: false, message: 'Team ID, answer, and page number are required' });
            }

        // Assuming you have a function that checks if the answer is correct
        if (isAnswerCorrect(answer, page)) {
            // If the answer is correct, update the team's progress
            db.collection('teams').updateOne(
                    { _id: new ObjectId(teamId) }, // Corrected line here
                    { $set: { progress: page + 1 } } // Increment progress
                )
            .then(result => {
                if (result.matchedCount === 0) {
                    // If no team was found with the provided ID
                    return res.status(404).json({ success: false, message: 'Team not found' });
                }
                res.json({ success: true, message: 'Progress updated successfully' });
            })
            .catch(error => {
                console.error('Error updating progress:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            });
        } else {
            // If the answer is incorrect
            res.json({ success: false, message: 'Incorrect answer' });
        }
    });

    function isAnswerCorrect(answer, page) {
        // Parse page into a number
        const pageIndex = parseInt(page, 10);

        // Validate pageIndex is a number
        if (isNaN(pageIndex)) {
            console.error('Invalid page number:', page);
            return false;
        }

        // Example: answers for each page (replace with actual answers)
        if (pageIndex == 0)
            return answer == '1111';
        if (pageIndex == 1)
            return answer == 'compiler' || answer == 'Compiler';
        if (pageIndex == 2)
            return answer == '26';
        if (pageIndex == 3)
            return answer == '3';
        if (pageIndex == 4)
            return answer == '72';
        if (pageIndex == 5)
            return answer == '[2, 3, 7, 11, 12], [5, 6, 8, 9], [1, 4, 10, 13]' || answer == '[2, 3, 11, 12], [5, 6, 7, 8, 9], [1, 4, 10, 13]';
        if (pageIndex == 6)
            return answer == '0';
        if (pageIndex == 7)
            return answer == '22';
        if (pageIndex == 8)
            return answer == 'Yes' || answer == 'yes';
        if (pageIndex == 9)
            return answer == 'pseudocode' || answer == 'Pseudocode';
        if (pageIndex == 10)
            return answer == 'Bubble Sort';
        if (pageIndex == 11)
            return answer == 'Dynamic Programming';
        if (pageIndex == 12)
            return answer == 'Graphics Processing Unit';
        if (pageIndex == 13)
            return answer == 'No';
        if (pageIndex == 14)
            return answer == 'Stack';
        if (pageIndex == 15)
            return answer == 'Central Processing Unit';

        return answer === answers[pageIndex];
    }

    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
