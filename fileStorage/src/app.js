import fileRoutes from './routes/FileRoutes.js';
import express from 'express';
import config from './config.js';
import mongoose from 'mongoose';
import fs from 'fs';
import https from 'https';

const opts = {
    pfx: fs.readFileSync(`${process.env.CERTIFICATE_P12}`),
    passphrase: process.env.CERTIFICATE_P12_PASSWORD,
    requestCert: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync(`${process.env.TRUST_STORE_PATH}`)
};

const app = express();
app.disable('x-powered-by');
app.use('/', fileRoutes);

const connectToDb = function() {
    mongoose.connect(config.mongodb).catch((err) => {
        if (err) {
            setTimeout(connectToDb, 5000);
        }
    });
};
connectToDb();


mongoose.connection.on('connected', () => {
    console.log('Connected to database');
});

mongoose.connection.on('disconnected', () => {
    console.log('Database is disconnected');
});

mongoose.connection.on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
});

https.createServer(opts, app).listen(config.PORT);
