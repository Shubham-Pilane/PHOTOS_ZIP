const express = require("express");
const axios = require("axios");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8000;

// Load image data from db.json
const imageData = require("./db.json");

app.get("/", (req, res) => {
    res.send("Hi from Shubham");
});

app.get("/img", async (req, res) => {
    const startTime = Date.now(); 
    try {
        const zip = archiver('zip', {
            zlib: { level: 9 }
        });
        res.attachment('images.zip');
        zip.pipe(res);

        const imagePromises = imageData.map(image => 
            axios({
                url: image.getUrl,
                responseType: 'stream'
            }).then(response => {
                return { data: response.data, title: image.title };
            })
        );

        const images = await Promise.all(imagePromises);

        images.forEach(image => {
            zip.append(image.data, { name: image.title });
        });

        zip.finalize();

        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000; 
        console.log(`ZIP file creation took ${timeTaken.toFixed(2)} seconds`);
        console.log(`Number of images : ${images.length}`);
    } catch (error) {
        console.error("Error downloading images:", error);
        res.status(500).send("Error downloading images");
    }
});

app.listen(port, () => {
    console.log(`Server is live on port ${port}`);
});
