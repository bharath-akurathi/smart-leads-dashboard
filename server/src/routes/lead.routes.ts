import { Router } from 'express';
import * as lc from '../controllers/leadController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// All lead routes require authentication
router.use(authMiddleware);

// ⚠️ Static routes MUST come before parameterized routes
router.get('/stats', lc.getLeadStats);
router.get('/export/csv', lc.exportLeadsCSV);

// Bulk operations
router.patch('/bulk/status', lc.bulkUpdateStatus);
router.delete('/bulk', lc.bulkDelete);

// Standard CRUD
router.get('/', lc.getLeads);
router.post('/', lc.createLead);
router.get('/:id', lc.getLeadById);
router.put('/:id', lc.updateLead);
router.delete('/:id', lc.deleteLead);

export default router;
