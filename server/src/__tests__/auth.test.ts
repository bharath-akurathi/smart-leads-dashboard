import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app';
import User from '../models/User.model';

dotenv.config({ path: '.env' });

// ── Helpers ────────────────────────────────────────────────────
let mongoConnected = false;

jest.setTimeout(30000);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    const testUri = process.env.MONGO_URI!.replace(/\/\?/, '/smart-leads-test-auth?');
    await mongoose.connect(testUri);
    mongoConnected = true;
  }
  await User.init(); // Ensure unique indexes are built
});

afterAll(async () => {
  await User.deleteMany({});
  if (mongoConnected) await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ── Tests ──────────────────────────────────────────────────────
describe('Auth API', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'sales' as const,
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token + user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toMatchObject({
        name: validUser.name,
        email: validUser.email,
        role: validUser.role,
      });
      // Password must not be returned
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject registration with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'not-an-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: 'short' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject registration with missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: validUser.email, password: validUser.password, role: 'sales' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should login with valid credentials and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
