const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getBranches,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} = require('../controllers/branchController');

router.get('/', getBranches);
router.get('/admin', authMiddleware, getAllBranches);
router.post('/admin', authMiddleware, createBranch);
router.put('/admin/:id', authMiddleware, updateBranch);
router.delete('/admin/:id', authMiddleware, deleteBranch);

module.exports = router;
