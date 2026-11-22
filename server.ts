import express from 'express';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { createSqliteModel } from './dbFallback.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const APP_URL = process.env.APP_URL || 'https://ais-dev-wp5niehtvu3tp24uwgy6ih-529935503953.asia-southeast1.run.app';

// --- MONGODB SCHEMA SETUP ---
mongoose.set('bufferCommands', false);

mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  password: { type: String },
  role: { type: String, default: 'user' },
  city: String,
  skills: String,
  volunteerHours: { type: Number, default: 0 },
  impactScore: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const MongoUser = mongoose.model('User', userSchema);

const initiativeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  lat: Number,
  lng: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fundingRequired: { type: Boolean, default: false },
  estimatedCost: { type: Number, default: 0 },
  suppliesNeeded: String,
  startDate: Date,
  endDate: Date,
  status: { type: String, default: 'Open' },
  completedAt: Date,
  beforePhoto: String,
  afterPhoto: String,
  celebrationMessage: String,
  verified: { type: Boolean, default: false },
  emergency: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
const MongoInitiative = mongoose.model('Initiative', initiativeSchema);

const volunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initiativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative', required: true },
  role: String,
  status: { type: String, default: 'Volunteer – Pending Completion' },
  joinedAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
volunteerSchema.index({ userId: 1, initiativeId: 1 }, { unique: true });
const MongoVolunteer = mongoose.model('Volunteer', volunteerSchema);

const taskSchema = new mongoose.Schema({
  initiativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative', required: true },
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'todo' },
  createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
const MongoTask = mongoose.model('Task', taskSchema);

const feedSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  initiativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
const MongoFeed = mongoose.model('Feed', feedSchema);

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complainantName: String,
  complainantEmail: String,
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  sector: { type: String, required: true },
  ward: { type: String, required: true },
  city: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: { type: String, default: 'PENDING' },
  assignedTo: { type: String, default: 'Officer 1' },
  officer1Replied: { type: Boolean, default: false },
  officer2Replied: { type: Boolean, default: false },
  officer1Reply: String,
  officer2Reply: String,
  escalated: { type: Boolean, default: false },
  escalatedToAuditor: { type: Boolean, default: false },
  resolvedAt: Date,
  escalatedAt: Date,
  auditorEscalatedAt: Date,
  tokensEarned: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
const MongoComplaint = mongoose.model('Complaint', complaintSchema);

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initiativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative', required: true },
  certificateId: { type: String, unique: true, required: true },
  type: { type: String, required: true },
  userName: String,
  role: String,
  actionTitle: String,
  qrLink: String,
  verificationHash: String,
  issuedAt: { type: Date, default: Date.now }
});
const MongoCertificate = mongoose.model('Certificate', certificateSchema);

const messageSchema = new mongoose.Schema({
  initiativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: String,
  fileUrl: String,
  fileName: String,
  fileType: String,
  type: { type: String, default: 'chat' },
  createdAt: { type: Date, default: Date.now }
});
const MongoMessage = mongoose.model('Message', messageSchema);

const donationSchema = new mongoose.Schema({
  initiativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});
const MongoDonation = mongoose.model('Donation', donationSchema);

let User: any = MongoUser;
let Initiative: any = MongoInitiative;
let Volunteer: any = MongoVolunteer;
let Task: any = MongoTask;
let Feed: any = MongoFeed;
let Complaint: any = MongoComplaint;
let Certificate: any = MongoCertificate;
let Message: any = MongoMessage;
let Donation: any = MongoDonation;

// --- AI SETUP ---
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// --- FIREBASE ADMIN ---
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));
} catch (e) {
  console.warn('Could not load firebase-applet-config.json for project ID verification');
}

if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId || process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized with service account');
    } catch (error) {
      console.warn('Firebase Admin service account init skipped:', (error as any)?.message);
    }
  } else if (firebaseConfig.projectId && firebaseConfig.projectId !== 'remixed-project-id') {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log('Firebase Admin initialized for token verification on project:', firebaseConfig.projectId);
  }
}

// --- NODEMAILER ---
const GMAIL_USER = (process.env.GMAIL_USER || '').trim();
const GMAIL_PASS = (process.env.GMAIL_PASS || '').trim();

const transporter = GMAIL_USER && GMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    })
  : null;

const sendRealEmail = async (to: string, subject: string, text: string, html?: string, attachments?: any[]) => {
  if (!transporter || !GMAIL_USER || !GMAIL_PASS) {
    console.log(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"The Public Assembly" <${GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments
    });
    console.log(`[REAL EMAIL SENT] Successfully sent to: ${to}`);
    return true;
  } catch (error: any) {
    console.warn('[EMAIL FALLBACK] Could not deliver email via SMTP:', error.message);
    return false;
  }
};

// --- SERVER START ---
async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // --- DATABASE INITIALIZATION ---
  let mongoConnected = false;
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      mongoConnected = true;
      console.log('Connected to MongoDB');
    } catch (err: any) {
      console.warn('MongoDB unavailable, switching to embedded SQLite persistence:', err.message);
    }
  }

  if (!mongoConnected) {
    User = createSqliteModel('users', { role: 'user', volunteerHours: 0, impactScore: 0, available: true });
    Initiative = createSqliteModel('initiatives', { fundingRequired: false, estimatedCost: 0, status: 'Open', verified: false, emergency: false });
    Volunteer = createSqliteModel('volunteers', { role: 'Volunteer', status: 'Volunteer – Pending Completion' });
    Task = createSqliteModel('tasks', { status: 'todo' });
    Feed = createSqliteModel('feeds', {});
    Complaint = createSqliteModel('complaints', { status: 'PENDING', assignedTo: 'Officer 1', officer1Replied: false, officer2Replied: false, escalated: false, escalatedToAuditor: false, tokensEarned: 0 });
    Certificate = createSqliteModel('certificates', {});
    Message = createSqliteModel('messages', { type: 'chat' });
    Donation = createSqliteModel('donations', { amount: 10 });
    console.log('Using embedded SQLite database (public_assembly.db)');
  }

  // --- SEEDING (Only if empty) ---
  let adminUser: any;
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      adminUser = await User.create({
        fullName: 'Krishi Navale',
        email: 'krishi@publicassembly.com',
        password: hashedPassword,
        role: 'admin',
        city: 'Mumbai'
      });
      console.log('Admin user seeded');
    } else {
      adminUser = await User.findOne({ role: 'admin' });
    }

    const initiativeCount = await Initiative.countDocuments();
    if (initiativeCount === 0 && adminUser) {
      const missionSeeds = [
        { title: 'Lake Restoration Project', category: 'Environment', city: 'Mumbai', description: 'Restoring the ecosystem of Powai Lake through community cleanup and aeration.', estimatedCost: 75000, suppliesNeeded: 'Aeration pumps, nets, gloves' },
        { title: 'Digital Literacy Hub', category: 'Education', city: 'Mumbai', description: 'Teaching basic computer skills to senior citizens and children.', estimatedCost: 45000, suppliesNeeded: 'Laptops, workbooks, projector' },
        { title: 'Pothole Repair Squad', category: 'Infrastructure', city: 'Mumbai', description: 'Community-led quick-fix team for local road maintenance.', estimatedCost: 60000, suppliesNeeded: 'Cold asphalt mix, safety cones, shovels' },
        { title: 'Senior Companion Program', category: 'Life', city: 'Mumbai', description: 'Volunteers spending time with elderly living alone.', estimatedCost: 20000, suppliesNeeded: 'First aid kits, board games, care packages' },
        { title: 'Blood Donation Drive', category: 'Health', city: 'Mumbai', description: 'Monthly camps to maintain local blood bank supplies.', estimatedCost: 35000, suppliesNeeded: 'Medical tents, refreshments, sterilizers' }
      ];
      await Initiative.insertMany(missionSeeds.map(m => ({ ...m, createdBy: adminUser._id, verified: true })));
      console.log('Missions seeded');
    }

    const feedCount = await Feed.countDocuments();
    if (feedCount === 0 && adminUser) {
      await Feed.create({
        type: 'initiative_created',
        message: 'Public Assembly network initialized with 5 verified community missions in Mumbai.',
        userId: adminUser._id
      });
    }
  } catch (seedErr: any) {
    console.warn('Database seeding warning:', seedErr.message);
  }

  // --- SOCKET LOGIC ---
  io.on('connection', (socket) => {
    socket.on('join:feed', () => socket.join('global_feed'));
    socket.on('join:initiative', (id) => socket.join(`initiative_${id}`));
    socket.on('join:task', (id) => socket.join(`task_${id}`));
  });

  const addToFeed = async (type: string, message: string, initiativeId?: string, userId?: string) => {
    const feedItem = await Feed.create({ type, message, initiativeId, userId });
    io.to('global_feed').emit('feed:update', feedItem);
    return feedItem;
  };

  // --- API ROUTES ---

  app.get('/api/stats', async (req, res) => {
    try {
      const totalInitiatives = await Initiative.countDocuments();
      const completedLower = await Initiative.countDocuments({ status: 'Completed' });
      const completedUpper = await Initiative.countDocuments({ status: 'COMPLETED' });
      const completedInitiatives = completedLower + completedUpper;
      const activeCities = (await Initiative.distinct('city')).length;
      const totalVolunteers = await Volunteer.countDocuments();
      res.json({
        totalInitiatives: totalInitiatives + 124,
        completedInitiatives: completedInitiatives + 86,
        activeCities: activeCities + 12,
        volunteerHours: (totalVolunteers + 450) * 12,
        fundsUtilized: 850000
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load stats' });
    }
  });

  app.get('/api/feed', async (req, res) => {
    try {
      const feed = await Feed.find().sort({ createdAt: -1 }).limit(50);
      res.json(feed);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load feed' });
    }
  });

  app.get('/api/admin/test-email', async (req, res) => {
    const user = process.env.GMAIL_USER?.trim() || GMAIL_USER;
    const pass = process.env.GMAIL_PASS?.trim() || GMAIL_PASS;
    
    if (!user || !pass) {
      return res.status(400).json({ 
        error: 'GMAIL_USER or GMAIL_PASS is missing in environment variables.',
        instructions: 'Please set these in the Settings menu.'
      });
    }

    console.log(`[TEST EMAIL] Attempting to send test email to: ${user}`);
    const success = await sendRealEmail(
      user, 
      'Prospera Assembly: SMTP Test', 
      'This is a test email to verify your Gmail SMTP settings. If you received this, your configuration is correct!',
      '<div style="font-family: sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 10px;">' +
      '<h2 style="color: #3b82f6;">SMTP Connection Successful!</h2>' +
      '<p>Your Gmail SMTP settings are working correctly.</p>' +
      '<p><strong>User:</strong> ' + user + '</p>' +
      '</div>'
    );

    if (success) {
      res.json({ message: 'Test email sent successfully! Check your inbox (and spam folder).' });
    } else {
      res.status(500).json({ 
        error: 'Failed to send test email. Check server logs for details.',
        diagnostic: 'Common cause: 535 Authentication Failed. Ensure you are using a 16-character App Password.'
      });
    }
  });

  app.get('/api/initiatives', async (req, res) => {
    try {
      const initiatives = await Initiative.find().populate('createdBy', 'fullName').sort({ createdAt: -1 });
      res.json(initiatives);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load initiatives' });
    }
  });

  app.get('/api/initiatives/:id', async (req, res) => {
    try {
      const initiative = await Initiative.findById(req.params.id).populate('createdBy', 'fullName');
      if (!initiative) return res.status(404).json({ error: 'Not found' });
      const volunteers = await Volunteer.find({ initiativeId: req.params.id }).populate('userId', 'fullName');
      const supportCount = await Donation.countDocuments({ initiativeId: req.params.id });
      res.json({ ...initiative.toObject(), volunteers, supportCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load initiative' });
    }
  });

  app.post('/api/initiatives', async (req, res) => {
    try {
      const { title, description, category, city, state, lat, lng, createdBy, fundingRequired, estimatedCost, suppliesNeeded, emergency } = req.body || {};
      if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim() || typeof category !== 'string' || !category.trim() || typeof city !== 'string' || !city.trim()) {
        return res.status(400).json({ error: 'Title, description, category, and city are required.' });
      }
      const initiative = await Initiative.create({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        city: city.trim(),
        state: typeof state === 'string' ? state.trim() : undefined,
        lat: typeof lat === 'number' ? lat : undefined,
        lng: typeof lng === 'number' ? lng : undefined,
        createdBy: typeof createdBy === 'string' && createdBy.trim() ? createdBy.trim() : undefined,
        fundingRequired: Boolean(fundingRequired),
        estimatedCost: Number(estimatedCost) || 0,
        suppliesNeeded: typeof suppliesNeeded === 'string' ? suppliesNeeded.trim() : '',
        emergency: Boolean(emergency)
      });
      await addToFeed('initiative_created', `New initiative: ${initiative.title}`, initiative._id.toString(), createdBy);
      
      const creator = typeof createdBy === 'string' && createdBy.trim() ? await User.findById(createdBy.trim()) : null;
      if (creator) {
        try {
          await generateCertificate(creator, initiative, 'Leader', 'Certificate of Initiation');
        } catch (certErr: any) {
          console.error('[INITIATIVE CREATE] Certificate generation failed:', certErr.message);
        }
      }
      io.emit('initiative:new', initiative);
      res.json(initiative);
    } catch (error: any) {
      console.error('[INITIATIVE CREATE ERROR]', error.message);
      res.status(500).json({ error: error.message || 'Failed to create initiative' });
    }
  });

  app.post('/api/initiatives/:id/join', async (req, res) => {
    try {
      const { userId } = req.body || {};
      const initiativeId = req.params.id;
      if (typeof userId !== 'string' || !userId.trim()) {
        return res.status(400).json({ error: 'Valid userId is required.' });
      }

      // Check if already joined
      const existing = await Volunteer.findOne({ initiativeId, userId: userId.trim() });
      if (existing) {
        return res.status(400).json({ error: 'You have already joined this initiative' });
      }

      await Volunteer.create({ 
        userId: userId.trim(), 
        initiativeId,
        role: 'Volunteer',
        status: 'Volunteer – Pending Completion'
      });

      const count = await Volunteer.countDocuments({ initiativeId });
      const initiative = await Initiative.findById(initiativeId);
      const user = await User.findById(userId.trim());

      if (user && initiative) {
        try {
          await generateCertificate(user, initiative, 'Volunteer', 'Certificate of Enrollment');
        } catch (certErr: any) {
          console.error('[VOLUNTEER JOIN] Certificate generation failed:', certErr.message);
        }
        await addToFeed('volunteer_joined', `${user.fullName} joined ${initiative.title}`, initiative._id.toString(), user._id.toString());
      }

      io.to(`initiative_${initiativeId}`).emit('volunteer:update', { initiativeId, count });
      res.json({ success: true, count });
    } catch (e: any) {
      console.error('[VOLUNTEER JOIN ERROR]', e.message);
      res.status(500).json({ error: e.message || 'Failed to join initiative' });
    }
  });

  app.post('/api/tasks/:id/status', async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('assignedTo', 'fullName');
      if (!task) return res.status(404).json({ error: 'Task not found' });
      if (req.body.status === 'completed' && task.assignedTo) {
        const initiative = await Initiative.findById(task.initiativeId);
        const assignedUserId = typeof task.assignedTo === 'object' ? (task.assignedTo._id || task.assignedTo.id) : task.assignedTo;
        const user = assignedUserId ? await User.findById(assignedUserId) : null;
        if (user && initiative) {
          sendRealEmail(user.email, "Task Completed", `Completed ${task.title} in ${initiative.title}`);
        }
      }
      const initId = typeof task.initiativeId === 'object' ? (task.initiativeId._id || task.initiativeId.id) : task.initiativeId;
      io.to(`initiative_${initId}`).emit('task:update', task.toJSON());
      io.to(`task_${req.params.id}`).emit('task:update', task.toJSON());
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update task status' });
    }
  });

  app.get('/api/initiatives/:id/messages', async (req, res) => {
    try {
      const messages = await Message.find({ initiativeId: req.params.id }).populate('userId', 'fullName').sort({ createdAt: 1 });
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load messages' });
    }
  });

  app.post('/api/initiatives/:id/messages', async (req, res) => {
    try {
      const created = await Message.create({ ...req.body, initiativeId: req.params.id });
      const message = await created.populate('userId', 'fullName');
      io.to(`initiative_${req.params.id}`).emit('message:new', message);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to send message' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const created = await Task.create(req.body);
      const task = req.body.assignedTo ? await created.populate('assignedTo', 'fullName') : created;
      io.to(`initiative_${req.body.initiativeId}`).emit('task:new', task.toJSON());
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create task' });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const task = await Task.findById(req.params.id).populate('assignedTo', 'fullName').populate('initiativeId');
      if (!task) return res.status(404).json({ error: 'Not found' });

      const initObj = typeof task.initiativeId === 'object' ? task.initiativeId : await Initiative.findById(task.initiativeId);
      const initiativeIdStr = String(initObj?._id || initObj?.id || task.initiativeId || '');
      const leaderIdStr = initObj?.createdBy
        ? String(typeof initObj.createdBy === 'object' ? (initObj.createdBy._id || initObj.createdBy.id) : initObj.createdBy)
        : '';
      const leaderUser = leaderIdStr ? await User.findById(leaderIdStr).select('fullName') : null;
      const assignedObj = typeof task.assignedTo === 'object' ? task.assignedTo : null;
      const assignedIdStr = assignedObj ? String(assignedObj._id || assignedObj.id) : (task.assignedTo ? String(task.assignedTo) : '');

      const volunteers = initiativeIdStr
        ? await Volunteer.find({ initiativeId: initiativeIdStr }).populate('userId', 'fullName email')
        : [];

      const members = volunteers
        .map((v: any) => v.userId)
        .filter((u: any) => u && typeof u === 'object');

      res.json({
        ...task.toObject(),
        initiativeId: initiativeIdStr,
        initiative: initObj || null,
        leaderId: leaderIdStr,
        leaderName: leaderUser?.fullName || 'Assembly Leader',
        assignedToId: assignedIdStr,
        assignedName: assignedObj?.fullName || null,
        members
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load task' });
    }
  });

  app.get('/api/tasks/:id/messages', async (req, res) => {
    try {
      const messages = await Message.find({ taskId: req.params.id }).populate('userId', 'fullName').sort({ createdAt: 1 });
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load task messages' });
    }
  });

  app.post('/api/tasks/:id/messages', async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      const created = await Message.create({ ...req.body, taskId: req.params.id, initiativeId: task.initiativeId });
      const message = await created.populate('userId', 'fullName');
      io.to(`task_${req.params.id}`).emit('task_message:new', message);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to send task message' });
    }
  });

  app.post('/api/tasks/:id/assign', async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { assignedTo: req.body.userId || null },
        { new: true }
      ).populate('assignedTo', 'fullName');
      if (!task) return res.status(404).json({ error: 'Task not found' });
      const initId = typeof task.initiativeId === 'object' ? (task.initiativeId._id || task.initiativeId.id) : task.initiativeId;
      io.to(`initiative_${initId}`).emit('task:update', task.toJSON());
      io.to(`task_${req.params.id}`).emit('task:update', task.toJSON());
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to assign task' });
    }
  });

  app.post('/api/initiatives/:id/announcements', async (req, res) => {
    try {
      const created = await Message.create({ ...req.body, initiativeId: req.params.id, type: 'announcement' });
      const announcement = await created.populate('userId', 'fullName');
      io.to(`initiative_${req.params.id}`).emit('announcement:new', announcement);
      await addToFeed('announcement', req.body.text, req.params.id, req.body.userId);
      res.json(announcement);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to post announcement' });
    }
  });

  app.get('/api/initiatives/:id/announcements', async (req, res) => {
    try {
      const announcements = await Message.find({ initiativeId: req.params.id, type: 'announcement' }).populate('userId', 'fullName').sort({ createdAt: -1 });
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load announcements' });
    }
  });

  app.get('/api/initiatives/:id/volunteers', async (req, res) => {
    try {
      const volunteers = await Volunteer.find({ initiativeId: req.params.id }).populate('userId', 'fullName email');
      res.json(volunteers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load volunteers' });
    }
  });

  app.get('/api/initiatives/:id/tasks', async (req, res) => {
    try {
      const tasks = await Task.find({ initiativeId: req.params.id }).populate('assignedTo', 'fullName');
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load tasks' });
    }
  });

  app.post('/api/initiatives/:id/status', async (req, res) => {
    try {
      const initiative = await Initiative.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('createdBy', 'fullName');
      if (!initiative) return res.status(404).json({ error: 'Not found' });
      io.to(`initiative_${req.params.id}`).emit('initiative:update', initiative);
      await addToFeed('status_change', `Initiative status changed to ${req.body.status}`, req.params.id);
      res.json(initiative);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update status' });
    }
  });

  // --- THE AUDITOR API ---
  app.post('/api/complaints', async (req, res) => {
    const { userId, rawDescription, sector, ward, city, location, complainantName, complainantEmail } = req.body || {};
    if (typeof rawDescription !== 'string' || !rawDescription.trim() || typeof sector !== 'string' || !sector.trim() || typeof ward !== 'string' || !ward.trim() || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ error: 'Description, sector, ward, and city are required.' });
    }
    const title = `Issue in ${sector.trim()} - Ward ${ward.trim()}`;
    const subject = `Formal Complaint regarding ${sector.trim().toLowerCase()} services`;
    const description = rawDescription.trim();
    const officer1Name = "Officer 1";
    const officer1Email = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "admin@example.com";
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    try {
      const complaint = await Complaint.create({
        userId, complainantName, complainantEmail, title, subject, description, sector: sector.trim(), ward: ward.trim(), city: city.trim(), location,
        assignedTo: officer1Name, expiresAt
      });

      const mapsLink = location?.lat ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : 'Not provided';
      
      // Generate Secure Tokens
      const resolveToken = jwt.sign({ complaintId: complaint._id, action: 'resolve', email: officer1Email }, JWT_SECRET, { expiresIn: '30m' });
      const replyToken = jwt.sign({ complaintId: complaint._id, action: 'reply', email: officer1Email }, JWT_SECRET, { expiresIn: '30m' });

      const baseUrl = req.headers.origin || APP_URL;
      const resolveUrl = `${baseUrl}/officer-action/resolve?complaintId=${complaint._id}&token=${resolveToken}`;
      const replyUrl = `${baseUrl}/officer-action/reply?complaintId=${complaint._id}&token=${replyToken}`;

      const officer1Html = `
        <div style="font-family: serif; padding: 40px; border: 1px solid #ddd; max-width: 600px;">
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>To,<br>Officer 1<br>Department of Public Resolution</p>
          <p><strong>Subject: Formal Complaint Submission – ID ${complaint._id}</strong></p>
          <p>Respected Sir/Madam,</p>
          <p>A complaint has been officially registered through the system. The details are as follows:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Complainant Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${complainantName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Sector:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${sector}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Ward:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${ward}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>City:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${city}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Description:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${description}</td></tr>
          </table>
          <p><strong>Location of Incident:</strong><br><a href="${mapsLink}">${mapsLink}</a></p>
          <p>This complaint requires resolution within 30 minutes as per system protocol.</p>
          <div style="margin-top: 30px;">
            <a href="${resolveUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">✅ Resolve & Stop Timer</a>
            <a href="${replyUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">💬 Reply to Complaint</a>
          </div>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">Sincerely,<br>Automated Complaint Monitoring System</p>
        </div>
      `;
      
      sendRealEmail(officer1Email, `Official Complaint Notice – ID ${complaint._id}`, "", officer1Html);

      const user = await User.findById(userId);
      if (user) {
        sendRealEmail(user.email, `Complaint Submitted: ${title}`, `Your complaint has been sent to ${officer1Name}. A 30-minute resolution window has started.`);
      }
      
      io.emit('complaint:new', complaint);
      res.json(complaint);
    } catch (error) {
      console.error('Complaint creation error:', error);
      res.status(500).json({ error: 'Failed to submit complaint' });
    }
  });

  app.get('/api/complaints', async (req, res) => {
    try {
      const complaints = await Complaint.find().sort({ createdAt: -1 });
      res.json(complaints);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch complaints' });
    }
  });

  // Officer Action Handler (JWT Validated)
  app.get('/api/officer-action/verify', async (req, res) => {
    const { token, complaintId } = req.query;
    try {
      const decoded: any = jwt.verify(token as string, JWT_SECRET);
      if (decoded.complaintId !== complaintId) throw new Error('Invalid complaint ID');
      
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

      res.json({ success: true, action: decoded.action, complaint });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized or expired token' });
    }
  });

  app.post('/api/complaints/:id/resolve', async (req, res) => {
    try {
      const { officer } = req.body;
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) return res.status(404).json({ error: 'Not found' });

      complaint.status = 'RESOLVED';
      complaint.resolvedAt = new Date();
      if (officer === 'Auditor') {
        complaint.assignedTo = 'Auditor';
      }
      await complaint.save();
      io.emit('complaint:update', complaint);
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ error: 'Failed to resolve' });
    }
  });

  app.post('/api/officer-action/resolve', async (req, res) => {
    const token = (req.body?.token || req.query?.token) as string;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const complaintId = (req.body?.complaintId || req.query?.complaintId || decoded.complaintId) as string;
      if (String(decoded.complaintId) !== String(complaintId) || decoded.action !== 'resolve') throw new Error('Invalid action');

      const complaint = await Complaint.findById(complaintId);
      if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

      complaint.status = 'RESOLVED';
      complaint.officer1Replied = true;
      complaint.resolvedAt = new Date();
      await complaint.save();

      io.emit('complaint:update', complaint);
      res.json({ success: true, message: 'Complaint resolved and timer stopped.' });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  app.post('/api/officer-action/reply', async (req, res) => {
    const token = (req.body?.token || req.query?.token) as string;
    const reply = req.body?.reply;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const complaintId = (req.body?.complaintId || req.query?.complaintId || decoded.complaintId) as string;
      if (String(decoded.complaintId) !== String(complaintId) || decoded.action !== 'reply') throw new Error('Invalid action');

      const complaint = await Complaint.findById(complaintId);
      if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

      if (decoded.email === (process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "admin@example.com")) {
        complaint.officer1Reply = reply;
        complaint.officer1Replied = true;
      } else if (decoded.email === "k52560815@gmail.com") {
        complaint.officer2Reply = reply;
        complaint.officer2Replied = true;
      }
      complaint.status = 'RESOLVED';
      complaint.resolvedAt = new Date();
      await complaint.save();

      // Notify complainant
      if (complaint.complainantEmail) {
        sendRealEmail(complaint.complainantEmail, `Reply to your Complaint: ${complaint.title}`, `An officer has replied: ${reply}`);
      }

      io.emit('complaint:update', complaint);
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  // Background Escalation Task (Every minute)
  setInterval(async () => {
    try {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Level 1: Escalate to Officer 2 after 30 mins
    const expired = await Complaint.find({ 
      status: 'PENDING', 
      createdAt: { $lt: thirtyMinsAgo },
      officer1Replied: false,
      escalated: false
    });
    
    for (const c of expired) {
      const officer1Email = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "admin@example.com";
      const officer2Name = "Officer 2 (Head Officer)";
      const officer2Email = "k52560815@gmail.com";
      
      c.status = 'ESCALATED';
      c.assignedTo = officer2Name;
      c.escalatedAt = now;
      c.escalated = true;
      await c.save();

      const mapsLink = c.location?.lat ? `https://www.google.com/maps?q=${c.location.lat},${c.location.lng}` : 'Not provided';
      const adminHtml = `
        <div style="font-family: sans-serif; padding: 40px; border: 2px solid #ef4444; max-width: 600px;">
          <h2 style="color: #ef4444;">ESCALATION NOTICE – Complaint ID ${c._id}</h2>
          <p><strong>No response was received from Officer 1 (${officer1Email}) within the 30-minute window.</strong></p>
          <hr>
          <p><strong>Original Complaint Details:</strong></p>
          <p><strong>Complainant:</strong> ${c.complainantName}</p>
          <p><strong>Sector:</strong> ${c.sector}</p>
          <p><strong>Ward:</strong> ${c.ward}</p>
          <p><strong>City:</strong> ${c.city}</p>
          <p><strong>Description:</strong> ${c.description}</p>
          <p><strong>Location:</strong> <a href="${mapsLink}">${mapsLink}</a></p>
          <p style="color: #ef4444; font-weight: bold;">Immediate attention required.</p>
        </div>
      `;
      sendRealEmail(officer2Email, `ESCALATED – Complaint ID ${c._id}`, "", adminHtml);
      io.emit('complaint:update', c);
    }

    // Level 2: Escalate to Auditor after 1 hour of escalation
    const auditorExpired = await Complaint.find({
      status: 'ESCALATED',
      escalatedAt: { $lt: oneHourAgo },
      officer2Replied: false,
      escalatedToAuditor: false
    });

    for (const c of auditorExpired) {
      const auditorEmail = "kaig05463@gmail.com";
      c.status = 'AUDITOR_REVIEW';
      c.escalatedToAuditor = true;
      c.auditorEscalatedAt = now;
      await c.save();

      const mapsLink = c.location?.lat ? `https://www.google.com/maps?q=${c.location.lat},${c.location.lng}` : 'Not provided';
      const auditorHtml = `
        <div style="font-family: sans-serif; padding: 40px; border: 2px solid #ef4444; max-width: 600px; background: #fef2f2;">
          <h2 style="color: #ef4444;">CRITICAL ESCALATION – Auditor Review Required</h2>
          <p><strong>Complaint ID ${c._id} has not been resolved by either Officer 1 or Officer 2.</strong></p>
          <hr>
          <p><strong>Details:</strong></p>
          <p><strong>Complainant:</strong> ${c.complainantName}</p>
          <p><strong>Sector:</strong> ${c.sector}</p>
          <p><strong>Ward:</strong> ${c.ward}</p>
          <p><strong>City:</strong> ${c.city}</p>
          <p><strong>Description:</strong> ${c.description}</p>
          <p><strong>Location:</strong> <a href="${mapsLink}">${mapsLink}</a></p>
          <p style="color: #ef4444; font-weight: bold;">Please take immediate action on the officers and resolve the complaint.</p>
        </div>
      `;
      sendRealEmail(auditorEmail, `CRITICAL ESCALATION – Complaint ID ${c._id}`, "", auditorHtml);
      io.emit('complaint:update', c);
    }
    } catch (escalationErr: any) {
      console.warn('Escalation worker warning:', escalationErr.message);
    }
  }, 60000);

  // --- CERTIFICATE GENERATION ---
  const generateCertificate = async (user: any, initiative: any, role: string, type: string) => {
    console.log(`[CERTIFICATE GENERATION] Starting for user: ${user.fullName} (${user.email}), type: ${type}`);
    const certId = `CERT-${new Date().getFullYear()}-${initiative._id.toString().substr(-5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const qrLink = `${APP_URL}/verify/${certId}`;
    
    try {
      // Generate QR Code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrLink);
      console.log(`[CERTIFICATE GENERATION] QR Code generated for ${certId}`);
      
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });
      const buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('error', (err) => {
          console.error('[PDF ERROR]', err);
          reject(err);
        });

        doc.on('end', async () => {
          try {
            console.log(`[CERTIFICATE GENERATION] PDF stream ended for ${certId}`);
            const pdfBuffer = Buffer.concat(buffers);
            
            console.log(`[CERTIFICATE GENERATION] Saving to database: ${certId}`);
            await Certificate.create({
              userId: user._id,
              initiativeId: initiative._id,
              certificateId: certId,
              type,
              userName: user.fullName,
              role,
              actionTitle: initiative.title,
              qrLink,
              issuedAt: new Date()
            });

            console.log(`[CERTIFICATE CREATED] ID: ${certId} for ${user.fullName}`);

            // Send Email
            const emailHtml = `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px;">
                <h2 style="color: #3b82f6;">${type} Issued – ${initiative.title}</h2>
                <p>Dear ${user.fullName},</p>
                <p>Congratulations! Your <strong>${type}</strong> for the mission "<strong>${initiative.title}</strong>" has been officially issued by Prospera Assembly.</p>
                <p>This certificate recognizes your commitment to community action and social impact.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Certificate ID:</strong> ${certId}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Verification Link:</strong> <a href="${qrLink}">${qrLink}</a></p>
                </div>
                <p>Please find the attached PDF certificate for your records.</p>
                <br>
                <p>Regards,<br><strong>Prospera Assembly Authority</strong></p>
              </div>
            `;

            console.log(`[CERTIFICATE GENERATION] Sending email to ${user.email}`);
            const emailSent = await sendRealEmail(user.email, `${type} Issued – ${initiative.title}`, "", emailHtml, [
              {
                filename: `${certId}.pdf`,
                content: pdfBuffer
              }
            ]);

            if (emailSent) {
              console.log(`[CERTIFICATE GENERATION] Email sent successfully to ${user.email}`);
            } else {
              console.warn(`[CERTIFICATE GENERATION] Email failed to send to ${user.email}, but certificate was created in DB.`);
            }

            resolve(certId);
          } catch (err: any) {
            console.error('[CERTIFICATE END ERROR]', err.message);
            reject(err);
          }
        });

      // --- PDF DESIGN ---
      // Decorative Border
      doc.lineWidth(10).strokeColor('#000000').rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.lineWidth(2).strokeColor('#000000').rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();
      
      // Corner Ornaments (Simulated)
      const ornamentSize = 40;
      doc.lineWidth(1).strokeColor('#000000');
      // Top Left
      doc.moveTo(20, 20 + ornamentSize).lineTo(20 + ornamentSize, 20).stroke();
      // Top Right
      doc.moveTo(doc.page.width - 20, 20 + ornamentSize).lineTo(doc.page.width - 20 - ornamentSize, 20).stroke();
      // Bottom Left
      doc.moveTo(20, doc.page.height - 20 - ornamentSize).lineTo(20 + ornamentSize, doc.page.height - 20).stroke();
      // Bottom Right
      doc.moveTo(doc.page.width - 20, doc.page.height - 20 - ornamentSize).lineTo(doc.page.width - 20 - ornamentSize, doc.page.height - 20).stroke();

      // Header
      let headerText = 'CERTIFICATE OF APPRECIATION';
      if (type === 'Certificate of Leadership') headerText = 'CERTIFICATE OF LEADERSHIP';
      if (type === 'Certificate of Initiation') headerText = 'CERTIFICATE OF INITIATION';
      if (type === 'Certificate of Enrollment') headerText = 'CERTIFICATE OF ENROLLMENT';

      doc.fontSize(40).font('Times-Bold').fillColor('#000000').text(headerText, { align: 'center', underline: true });
      doc.moveDown(1.5);

      // Body Text
      doc.fontSize(20).font('Times-Italic').fillColor('#000000').text('This Certificate is proudly awarded to', { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(48).font('Times-Bold').fillColor('#000000').text(user.fullName, { align: 'center' });
      doc.moveDown(0.5);

      const location = initiative.city || initiative.state || 'Real-Time Location';
      if (type === 'Certificate of Leadership') {
        doc.fontSize(18).font('Times-Italic').text('for successfully initiating and leading the action titled', { align: 'center' });
        doc.fontSize(24).font('Times-Bold').text(`"${initiative.title}"`, { align: 'center' });
        doc.fontSize(18).font('Times-Italic').text(`and ensuring its completion at ${location}`, { align: 'center' });
      } else if (type === 'Certificate of Initiation') {
        doc.fontSize(18).font('Times-Italic').text('for the successful launch of the community initiative', { align: 'center' });
        doc.fontSize(24).font('Times-Bold').text(`"${initiative.title}"`, { align: 'center' });
        doc.fontSize(18).font('Times-Italic').text(`at ${location}`, { align: 'center' });
      } else if (type === 'Certificate of Enrollment') {
        doc.fontSize(18).font('Times-Italic').text('for enrolling as a dedicated volunteer for the mission', { align: 'center' });
        doc.fontSize(24).font('Times-Bold').text(`"${initiative.title}"`, { align: 'center' });
        doc.fontSize(18).font('Times-Italic').text(`at ${location}`, { align: 'center' });
      } else {
        doc.fontSize(18).font('Times-Italic').text('in recognition of active participation in', { align: 'center' });
        doc.fontSize(24).font('Times-Bold').text(`"${initiative.title}"`, { align: 'center' });
        doc.fontSize(18).font('Times-Italic').text(`conducted at ${location}`, { align: 'center' });
      }
      doc.moveDown(2);

      // Footer
      const footerY = 450;
      doc.fontSize(14).font('Times-Roman').text('Given by: Prospera Assembly', 100, footerY);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 100, footerY + 20);
      doc.text(`Certificate ID: ${certId}`, 100, footerY + 40);

      // Signature
      const sigX = 550;
      doc.fontSize(16).font('Times-Bold').text('_______________________', sigX, footerY);
      const sigTitle = type === 'Certificate of Leadership' ? 'Head Officer' : 'Authorized Officer';
      doc.fontSize(14).font('Times-Roman').text(sigTitle, sigX + 40, footerY + 20);
      doc.fontSize(10).font('Times-Italic').text('Prospera Assembly Authority', sigX + 25, footerY + 40);

      // QR Code
      doc.image(qrCodeDataUrl, 380, footerY - 30, { width: 80 });
      doc.fontSize(8).font('Times-Roman').text('Scan to Verify Authenticity', 375, footerY + 55);

      // Gold Seal (Simulated)
      doc.circle(750, 80, 40).fillAndStroke('#FFD700', '#DAA520');
      doc.fontSize(10).font('Times-Bold').fillColor('#000000').text('OFFICIAL', 725, 70);
      doc.text('SEAL', 735, 85);

      doc.end();
    }).catch(err => {
      console.error('[CERTIFICATE PROMISE ERROR]', err);
      throw err;
    });
  } catch (err: any) {
    console.error('[CERTIFICATE OUTER ERROR]', err.message);
    throw err;
  }
};

  app.post('/api/initiatives/:id/complete', async (req, res) => {
    try {
      const { userId } = req.body;
      const initiative = await Initiative.findById(req.params.id);
      
      if (!initiative) return res.status(404).json({ error: 'Initiative not found' });
      if (initiative.status === 'COMPLETED') return res.status(400).json({ error: 'Already completed' });
      const creatorId = String(initiative.createdBy?._id || initiative.createdBy?.id || initiative.createdBy);
      if (creatorId !== String(userId)) return res.status(403).json({ error: 'Only leader can complete' });

      initiative.status = 'COMPLETED';
      initiative.completedAt = new Date();
      await initiative.save();

      await addToFeed('initiative_completed', `MISSION ACCOMPLISHED: ${initiative.title}! Global Celebration Initiated!`, initiative._id.toString(), userId);

      // Generate Leader Certificates
      const leader = await User.findById(creatorId);
      if (leader) {
        try {
          await generateCertificate(leader, initiative, 'Leader', 'Certificate of Leadership');
          await generateCertificate(leader, initiative, 'Leader', 'Certificate of Participation');
        } catch (certErr: any) {
          console.error('[COMPLETE CERT ERROR]', certErr.message);
        }
      }

      // Generate Volunteer Certificates
      const volunteers = await Volunteer.find({ initiativeId: req.params.id }).populate('userId');
      for (const v of volunteers) {
        if (v.userId) {
          try {
            await generateCertificate(v.userId, initiative, 'Volunteer', 'Certificate of Participation');
          } catch (certErr: any) {
            console.error('[VOLUNTEER CERT ERROR]', certErr.message);
          }
          v.status = 'Completed';
          await v.save();
        }
      }

      const populated = await Initiative.findById(req.params.id).populate('createdBy', 'fullName');
      io.emit('initiative:update', populated || initiative);
      res.json(populated || initiative);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to complete initiative' });
    }
  });

  app.post('/api/initiatives/:id/photos', async (req, res) => {
    try {
      const { type, photoUrl } = req.body;
      const initiative = await Initiative.findById(req.params.id);
      if (!initiative) return res.status(404).json({ error: 'Not found' });
      
      if (type === 'before') initiative.beforePhoto = photoUrl;
      else if (type === 'after') initiative.afterPhoto = photoUrl;
      
      await initiative.save();
      const populated = await Initiative.findById(req.params.id).populate('createdBy', 'fullName');
      io.to(`initiative_${req.params.id}`).emit('initiative:update', populated || initiative);
      res.json(populated || initiative);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to upload photo' });
    }
  });

  app.get('/api/users/:id/certificates', async (req, res) => {
    try {
      const certs = await Certificate.find({ userId: req.params.id }).sort({ issuedAt: -1 });
      res.json(certs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load certificates' });
    }
  });

  app.get('/api/certificates/:id/download', async (req, res) => {
    try {
      const cert = await Certificate.findById(req.params.id);
      if (!cert) return res.status(404).json({ error: 'Certificate not found' });
      
      const user = await User.findById(cert.userId);
      const initiative = await Initiative.findById(cert.initiativeId);
      
      if (!user || !initiative) return res.status(404).json({ error: 'Data not found' });

      // Re-generate PDF for download
      const certId = cert.certificateId;
      const qrLink = cert.qrLink;
      const qrCodeDataUrl = await QRCode.toDataURL(qrLink);
      
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${certId}.pdf`);
      doc.pipe(res);

      // --- PDF DESIGN ---
      doc.lineWidth(10).strokeColor('#000000').rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.lineWidth(2).strokeColor('#000000').rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();
      const ornamentSize = 40;
      doc.lineWidth(1).strokeColor('#000000');
      doc.moveTo(20, 20 + ornamentSize).lineTo(20 + ornamentSize, 20).stroke();
      doc.moveTo(doc.page.width - 20, 20 + ornamentSize).lineTo(doc.page.width - 20 - ornamentSize, 20).stroke();
      doc.moveTo(20, doc.page.height - 20 - ornamentSize).lineTo(20 + ornamentSize, doc.page.height - 20).stroke();
      doc.moveTo(doc.page.width - 20, doc.page.height - 20 - ornamentSize).lineTo(doc.page.width - 20 - ornamentSize, doc.page.height - 20).stroke();

      const headerText = cert.type === 'Certificate of Leadership' ? 'CERTIFICATE OF LEADERSHIP' : 'CERTIFICATE OF APPRECIATION';
      doc.fontSize(40).font('Times-Bold').fillColor('#000000').text(headerText, { align: 'center', underline: true });
      doc.moveDown(1.5);
      doc.fontSize(20).font('Times-Italic').fillColor('#000000').text('This Certificate is proudly awarded to', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(48).font('Times-Bold').fillColor('#000000').text(user.fullName, { align: 'center' });
      doc.moveDown(0.5);
      const location = initiative.city || initiative.state || 'Real-Time Location';
      if (cert.type === 'Certificate of Leadership') {
        doc.fontSize(18).font('Times-Italic').text('for successfully initiating and leading the action titled', { align: 'center' });
        doc.fontSize(24).font('Times-Bold').text(`"${initiative.title}"`, { align: 'center' });
        doc.fontSize(18).font('Times-Italic').text(`and ensuring its completion at ${location}`, { align: 'center' });
      } else {
        doc.fontSize(18).font('Times-Italic').text('in recognition of active participation in', { align: 'center' });
        doc.fontSize(24).font('Times-Bold').text(`"${initiative.title}"`, { align: 'center' });
        doc.fontSize(18).font('Times-Italic').text(`conducted at ${location}`, { align: 'center' });
      }
      doc.moveDown(2);
      const footerY = 450;
      doc.fontSize(14).font('Times-Roman').text('Given by: Prospera Assembly', 100, footerY);
      doc.text(`Date: ${new Date(cert.issuedAt).toLocaleDateString()}`, 100, footerY + 20);
      doc.text(`Certificate ID: ${certId}`, 100, footerY + 40);
      const sigX = 550;
      doc.fontSize(16).font('Times-Bold').text('_______________________', sigX, footerY);
      const sigTitle = cert.type === 'Certificate of Leadership' ? 'Head Officer' : 'Authorized Officer';
      doc.fontSize(14).font('Times-Roman').text(sigTitle, sigX + 40, footerY + 20);
      doc.fontSize(10).font('Times-Italic').text('Prospera Assembly Authority', sigX + 25, footerY + 40);
      doc.image(qrCodeDataUrl, 380, footerY - 30, { width: 80 });
      doc.fontSize(8).font('Times-Roman').text('Scan to Verify Authenticity', 375, footerY + 55);
      doc.circle(750, 80, 40).fillAndStroke('#FFD700', '#DAA520');
      doc.fontSize(10).font('Times-Bold').fillColor('#000000').text('OFFICIAL', 725, 70);
      doc.text('SEAL', 735, 85);
      doc.end();
    } catch (error: any) {
      console.error('[CERTIFICATE DOWNLOAD ERROR]', error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate certificate PDF' });
      }
    }
  });

  app.post('/api/initiatives/:id/support', async (req, res) => {
    try {
      await Donation.create({ userId: req.body.userId, initiativeId: req.params.id, amount: req.body.amount || 10 });
      const supportCount = await Donation.countDocuments({ initiativeId: req.params.id });
      const initiative = await Initiative.findById(req.params.id);
      const user = await User.findById(req.body.userId);
      if (user && initiative) await addToFeed('initiative_supported', `${user.fullName} supported ${initiative.title}`, req.params.id, req.body.userId);
      io.to(`initiative_${req.params.id}`).emit('initiative:support', { initiativeId: req.params.id, supportCount });
      res.json({ success: true, supportCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to record support' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('fullName email role');
      if (user) res.json(user); else res.status(404).json({ error: 'Not found' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load user' });
    }
  });

  const sanitizeUser = (u: any) => {
    if (!u) return u;
    const obj = typeof u.toObject === 'function' ? u.toObject() : { ...u };
    delete obj.password;
    return obj;
  };

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { fullName, email, password, city, phone } = req.body || {};
      if (typeof fullName !== 'string' || !fullName.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Full name, valid email, and password (min 6 characters) are required.' });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) return res.status(400).json({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ 
        fullName: fullName.trim(), 
        email: normalizedEmail, 
        password: hashedPassword, 
        city: typeof city === 'string' ? city.trim() : '', 
        phone: typeof phone === 'string' ? phone.trim() : '' 
      });

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user: sanitizeUser(user), token });
      sendRealEmail(normalizedEmail, "Welcome to The Public Assembly", `Welcome ${fullName.trim()}! Your account has been created.`);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user || !user.password) return res.status(400).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user: sanitizeUser(user), token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/google', async (req, res) => {
    try {
      const { idToken, email: bodyEmail, fullName: bodyFullName } = req.body || {};
      let email = typeof bodyEmail === 'string' ? bodyEmail.trim().toLowerCase() : '';
      let fullName = typeof bodyFullName === 'string' ? bodyFullName.trim() : 'Anonymous';

      if (typeof idToken === 'string' && idToken.trim()) {
        try {
          if (!admin.apps.length) {
            throw new Error('Firebase Admin not configured');
          }
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          email = (decodedToken.email || '').toLowerCase();
          fullName = decodedToken.name || 'Anonymous';
        } catch (error: any) {
          console.error('Firebase token verification failed:', error);
          return res.status(401).json({ error: 'Invalid token' });
        }
      }

      if (!email) return res.status(400).json({ error: 'Email is required' });

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ fullName, email, role: 'user' });
        sendRealEmail(email, "Welcome", `Welcome ${fullName}!`);
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user: sanitizeUser(user), token });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: 'Google sign-in failed' });
    }
  });

  app.post('/api/initiatives/:id/ai-suggestions', async (req, res) => {
    if (!genAI) return res.status(503).json({ error: 'AI features not configured' });
    
    try {
      const initiative = await Initiative.findById(req.params.id);
      if (!initiative) return res.status(404).json({ error: 'Initiative not found' });

      const prompt = `As an expert community organizer, suggest 5 specific, actionable tasks for a community initiative titled "${initiative.title}". 
      Description: ${initiative.description}
      Category: ${initiative.category}
      Location: ${initiative.city}
      
      Return the suggestions as a JSON array of strings. Format: ["Task 1", "Task 2", ...]`;

      const result = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const text = result.text;
      
      // Extract JSON from text (in case model adds markdown)
      const jsonMatch = text?.match(/\[.*\]/s);
      const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      res.json(suggestions);
    } catch (error) {
      console.error('[AI ERROR]', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });

  app.get('/api/verify/:certificateId', async (req, res) => {
    try {
      const cert = await Certificate.findOne({ certificateId: req.params.certificateId });
      if (!cert) return res.status(404).json({ status: 'INVALID' });
      
      res.json({
        status: 'VALID',
        name: cert.userName,
        role: cert.role,
        action: cert.actionTitle,
        issuedAt: cert.issuedAt,
        type: cert.type,
        certificateId: cert.certificateId
      });
    } catch (error) {
      res.status(500).json({ status: 'ERROR' });
    }
  });

  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  httpServer.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
