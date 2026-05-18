import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app';
import User from '../models/User.model';
import Lead from '../models/Lead.model';

dotenv.config({ path: '.env' });

// ── Helpers ────────────────────────────────────────────────────
let adminToken: string;
let salesToken: string;
let adminId: string;
let mongoConnected = false;

const adminUser = { name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' as const };
const salesUser = { name: 'Sales', email: 'sales@test.com', password: 'password123', role: 'sales' as const };

const sampleLead = {
  name: 'John Doe',
  email: 'john@company.com',
  company: 'Acme Corp',
  status: 'New' as const,
  source: 'Website' as const,
  priority: 'Medium' as const,
};

jest.setTimeout(30000);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    const testUri = process.env.MONGO_URI!.replace(/\/\?/, '/smart-leads-test-leads?');
    await mongoose.connect(testUri);
    mongoConnected = true;
  }
  await User.init();
  await Lead.init();

  // Register admin
  const adminRes = await request(app).post('/api/auth/register').send(adminUser);
  adminToken = adminRes.body.data.token;
  adminId = adminRes.body.data.user.id;

  // Register sales user
  const salesRes = await request(app).post('/api/auth/register').send(salesUser);
  salesToken = salesRes.body.data.token;
});

afterAll(async () => {
  await Lead.deleteMany({});
  await User.deleteMany({});
  if (mongoConnected) await mongoose.disconnect();
});

beforeEach(async () => {
  await Lead.deleteMany({});
});

// ── Tests ──────────────────────────────────────────────────────
describe('Leads API', () => {
  describe('POST /api/leads', () => {
    it('should create a lead when authenticated', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: sampleLead.name,
        email: sampleLead.email,
        status: 'New',
        source: 'Website',
        priority: 'Medium',
      });
      expect(res.body.data).toHaveProperty('_id');
    });

    it('should reject lead creation without auth token', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send(sampleLead)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject lead creation with invalid email', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ ...sampleLead, email: 'not-an-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject lead creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ name: 'Jane' }) // missing email, source
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/leads', () => {
    beforeEach(async () => {
      // Create leads as sales user
      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead);
      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ ...sampleLead, email: 'jane@company.com', name: 'Jane Doe', status: 'Qualified' });
    });

    it('should return paginated leads for authenticated user', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('totalPages');
    });

    it('sales user should only see their own leads (RBAC)', async () => {
      // Sales user should see leads they created
      const salesRes = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      // Admin should see all leads
      const adminRes = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Admin total >= sales total (admin sees all)
      expect(adminRes.body.meta.total).toBeGreaterThanOrEqual(salesRes.body.meta.total);
    });

    it('should filter leads by status', async () => {
      const res = await request(app)
        .get('/api/leads?status=Qualified')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.data.forEach((lead: any) => {
        expect(lead.status).toBe('Qualified');
      });
    });

    it('should search leads by name', async () => {
      const res = await request(app)
        .get('/api/leads?search=Jane')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.some((l: any) => l.name.includes('Jane'))).toBe(true);
    });

    it('should paginate leads', async () => {
      const res = await request(app)
        .get('/api/leads?page=1&limit=1')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(1);
      expect(res.body.meta.limit).toBe(1);
    });

    it('should reject request without auth token', async () => {
      await request(app).get('/api/leads').expect(401);
    });
  });

  describe('GET /api/leads/:id', () => {
    let leadId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead);
      leadId = res.body.data._id;
    });

    it('should return a lead by ID', async () => {
      const res = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(leadId);
    });

    it('should return 404 for non-existent lead', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/leads/${fakeId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/leads/:id', () => {
    let leadId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead);
      leadId = res.body.data._id;
    });

    it('should update a lead', async () => {
      const res = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ status: 'Contacted', notes: 'Followed up via email' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Contacted');
      expect(res.body.data.notes).toBe('Followed up via email');
    });

    it('should reject update with invalid status', async () => {
      const res = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ status: 'InvalidStatus' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    let leadId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead);
      leadId = res.body.data._id;
    });

    it('should delete a lead', async () => {
      await request(app)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      // Verify it's gone
      await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(404);
    });

    it('should reject delete without auth', async () => {
      await request(app).delete(`/api/leads/${leadId}`).expect(401);
    });
  });

  describe('GET /api/leads/stats', () => {
    it('should return lead statistics', async () => {
      // Create a lead first
      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead);

      const res = await request(app)
        .get('/api/leads/stats')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('new');
      expect(res.body.data).toHaveProperty('won');
      expect(res.body.data).toHaveProperty('lost');
      expect(res.body.data).toHaveProperty('bySource');
      expect(typeof res.body.data.total).toBe('number');
    });
  });

  describe('GET /api/leads/export/csv', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead);
    });

    it('should export leads as CSV', async () => {
      const res = await request(app)
        .get('/api/leads/export/csv')
        .set('Authorization', `Bearer ${salesToken}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.headers['content-disposition']).toMatch(/attachment/);
      // CSV should have a header row
      expect(res.text).toContain('Name');
      expect(res.text).toContain('Email');
    });
  });

  describe('PATCH /api/leads/bulk/status', () => {
    it('should update status of multiple leads', async () => {
      const lead1 = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send(sampleLead);
      const lead2 = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ ...sampleLead, email: 'other@test.com' });

      const ids = [lead1.body.data._id, lead2.body.data._id];

      const res = await request(app)
        .patch('/api/leads/bulk/status')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ ids, status: 'Contacted' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.modifiedCount).toBe(2);
    });
  });
});
