#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i <= 0) continue;
    const k = trimmed.slice(0, i).trim();
    const v = trimmed.slice(i + 1).trim();
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

(async () => {
  try {
    const root = path.resolve(__dirname, '..');
    loadEnv(path.join(root, '.env.local'));
    loadEnv(path.join(root, '.env'));

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'web_project_2';
    const userCollection = process.env.USER_COLLECTION || 'userData';

    if (!uri) {
      throw new Error('Missing MONGODB_URI');
    }

    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });

    const usersCount = await db.collection(userCollection).countDocuments({});
    console.log('DB connection: OK');
    console.log('Database:', dbName);
    console.log('User collection:', userCollection);
    console.log('Users count:', usersCount);

    await client.close();
  } catch (error) {
    console.error('DB connection: FAILED');
    console.error(error.message);
    process.exit(1);
  }
})();
