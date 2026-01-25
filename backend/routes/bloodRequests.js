import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import * as requestController from '../controllers/requestController.js';

const router = Router();

// Routes
router.get('/my-history', verifyToken, requestController.getMyValues); // Check naming in controller
router.get('/', requestController.getAllRequests);
router.get('/stats', requestController.getStats);
router.get('/pending', requestController.getPending);
router.get('/critical', requestController.getCritical);
router.get('/:id', requestController.getById);
router.get('/:id/matches', requestController.getMatches);

router.post('/', requestController.createRequest);
router.put('/:id', verifyToken, requestController.updateRequest);
router.put('/:id/fulfill', verifyToken, requestController.fulfillRequest);
router.put('/:id/cancel', verifyToken, requestController.cancelRequest);
router.delete('/:id', verifyToken, requestController.deleteRequest);

export default router;
