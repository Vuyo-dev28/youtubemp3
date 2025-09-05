import express, { application } from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/convert-mp3', async (req, res) => {
    const videoUrl = req.body.url;
    const videoIdMatch = videoUrl.match(/(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})/);
    if (!videoIdMatch) return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });

    const videoID = videoIdMatch[1];
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        return res.status(500).json({ success: false, message: 'RapidAPI key not configured.' });
    }

    try {
        const response = await fetch('https://tube-mp31.p.rapidapi.com/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': 'tube-mp31.p.rapidapi.com',
                'x-rapidapi-key': apiKey
            },
            body: JSON.stringify({ videoId: videoID })
        });
        const data = await response.json();

        if (data.status === 'success') {
            return res.json({ success: true, link: data.result.dlurl, title: data.title });
        } else if (data.status === 'processing') {
            return res.json({ success: false, message: 'Video is still processing, please try again in a few seconds.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to convert video.' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error contacting RapidAPI.' });
    }
});

app.get('/', (req, res) => {
    res.render("index");
});

export default app;
