import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.model';
import Lead from './src/models/Lead.model';

const generateDummyLeads = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'smart-leads' });
    console.log('Connected to DB');

    // Find a user to assign these leads to (preferably admin, or any user)
    let user = await User.findOne({});
    if (!user) {
      console.log('No user found, creating a dummy admin user...');
      user = await User.create({
        name: 'Admin User',
        email: 'admin@servicehive.com',
        password: 'password123',
        role: 'admin',
      });
    }

    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'James', 'Ava', 'Joseph', 'Isabella', 'Charles'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
    const companies = ['TechCorp', 'InnoVision', 'CloudSync', 'DataFlow', 'SmartSolutions', 'NextGen', 'GlobalTech', 'AlphaIndustries', 'BetaWorks', 'OmegaSystems'];

    const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
    const sources = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Google Ads', 'Instagram', 'Other'];
    const priorities = ['Low', 'Medium', 'High'];

    const dummyLeads = Array.from({ length: 15 }).map((_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`,
        phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        notes: `Automatically generated dummy lead.`,
        createdBy: user._id,
      };
    });

    await Lead.insertMany(dummyLeads);
    console.log('Successfully inserted 15 dummy leads');
    process.exit(0);
  } catch (error) {
    console.error('Error generating leads:', error);
    process.exit(1);
  }
};

generateDummyLeads();
