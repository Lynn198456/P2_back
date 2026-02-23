#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

(async () => {
  try {
    const root = path.resolve(__dirname, '..');
    loadEnvFile(path.join(root, '.env.local'));
    loadEnvFile(path.join(root, '.env'));

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'Web_P_Hsu';
    const userCollectionName = process.env.USER_COLLECTION || 'userData';
    const jobCollectionName = process.env.JOB_COLLECTION || 'Job';
    const proposalCollectionName = process.env.PROPOSAL_COLLECTION || 'Proposal';
    const contractCollectionName = process.env.CONTRACT_COLLECTION || 'Contract';
    const paymentCollectionName = process.env.PAYMENT_COLLECTION || 'Payment';
    const reviewCollectionName = process.env.REVIEW_COLLECTION || 'Review';

    if (!uri) {
      throw new Error('Missing MONGODB_URI. Set it in .env.local');
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const users = db.collection(userCollectionName);
    const jobs = db.collection(jobCollectionName);
    const proposals = db.collection(proposalCollectionName);
    const contracts = db.collection(contractCollectionName);
    const payments = db.collection(paymentCollectionName);
    const reviews = db.collection(reviewCollectionName);

    const now = new Date();
    const defaultPassword = 'Password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const userSeeds = [
      {
        sampleKey: 'sample_admin',
        name: 'System Admin',
        email: 'admin@webphsu.com',
        role: 'Admin',
        status: 'active',
      },
      {
        sampleKey: 'sample_client_1',
        name: 'Lynn Client',
        email: 'client@webphsu.com',
        role: 'Client',
        status: 'active',
      },
      {
        sampleKey: 'sample_freelancer_1',
        name: 'Aung Freelancer',
        email: 'freelancer@webphsu.com',
        role: 'Freelancer',
        status: 'active',
      },
      {
        sampleKey: 'sample_freelancer_2',
        name: 'Moe Designer',
        email: 'designer@webphsu.com',
        role: 'Freelancer',
        status: 'active',
      },
    ];

    for (const seed of userSeeds) {
      await users.updateOne(
        { sampleKey: seed.sampleKey },
        {
          $set: {
            ...seed,
            passwordHash,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }

    const admin = await users.findOne({ sampleKey: 'sample_admin' });
    const clientUser = await users.findOne({ sampleKey: 'sample_client_1' });
    const freelancer1 = await users.findOne({ sampleKey: 'sample_freelancer_1' });
    const freelancer2 = await users.findOne({ sampleKey: 'sample_freelancer_2' });

    const jobSeeds = [
      {
        sampleKey: 'sample_job_1',
        title: 'Build React Admin Dashboard',
        description: 'Need dashboard with auth, charts, and role-based pages.',
        budget: 1200,
        clientId: String(clientUser._id),
        status: 'open',
        category: 'Web Development',
      },
      {
        sampleKey: 'sample_job_2',
        title: 'Landing Page UI Redesign',
        description: 'Redesign landing page with modern UX and mobile responsive layout.',
        budget: 700,
        clientId: String(clientUser._id),
        status: 'open',
        category: 'UI/UX',
      },
    ];

    for (const seed of jobSeeds) {
      await jobs.updateOne(
        { sampleKey: seed.sampleKey },
        {
          $set: { ...seed, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }

    const job1 = await jobs.findOne({ sampleKey: 'sample_job_1' });
    const job2 = await jobs.findOne({ sampleKey: 'sample_job_2' });

    const proposalSeeds = [
      {
        sampleKey: 'sample_proposal_1',
        jobId: job1._id,
        jobTitle: job1.title,
        clientId: String(clientUser._id),
        freelancerId: String(freelancer1._id),
        price: 1100,
        message: 'I can deliver this dashboard in 12 days with clean architecture.',
        status: 'accepted',
      },
      {
        sampleKey: 'sample_proposal_2',
        jobId: job2._id,
        jobTitle: job2.title,
        clientId: String(clientUser._id),
        freelancerId: String(freelancer2._id),
        price: 650,
        message: 'I focus on clean UI systems and responsive components.',
        status: 'submitted',
      },
    ];

    for (const seed of proposalSeeds) {
      await proposals.updateOne(
        { sampleKey: seed.sampleKey },
        {
          $set: { ...seed, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }

    const acceptedProposal = await proposals.findOne({ sampleKey: 'sample_proposal_1' });

    await contracts.updateOne(
      { sampleKey: 'sample_contract_1' },
      {
        $set: {
          sampleKey: 'sample_contract_1',
          proposalId: acceptedProposal._id,
          jobId: acceptedProposal.jobId,
          clientId: acceptedProposal.clientId,
          freelancerId: acceptedProposal.freelancerId,
          amount: acceptedProposal.price,
          status: 'active',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    const contract = await contracts.findOne({ sampleKey: 'sample_contract_1' });

    await payments.updateOne(
      { sampleKey: 'sample_payment_1' },
      {
        $set: {
          sampleKey: 'sample_payment_1',
          contractId: String(contract._id),
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
          amount: 550,
          status: 'paid',
          note: 'Milestone 1 payment',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    await reviews.updateOne(
      { sampleKey: 'sample_review_1' },
      {
        $set: {
          sampleKey: 'sample_review_1',
          contractId: String(contract._id),
          reviewerId: String(clientUser._id),
          revieweeId: String(freelancer1._id),
          rating: 5,
          comment: 'Great communication and strong delivery quality.',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    console.log('Sample data seeded successfully.');
    console.log('Database:', dbName);
    console.log(
      'Collections:',
      userCollectionName,
      jobCollectionName,
      proposalCollectionName,
      contractCollectionName,
      paymentCollectionName,
      reviewCollectionName
    );
    console.log('Login credentials (all sample users):');
    console.log('Password:', defaultPassword);
    console.log('- admin@webphsu.com (Admin)');
    console.log('- client@webphsu.com (Client)');
    console.log('- freelancer@webphsu.com (Freelancer)');
    console.log('- designer@webphsu.com (Freelancer)');

    await client.close();
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
})();
