const express = require('express');
const {
    getAlgorithms,
    createAlgorithm,
    deleteAlgorithm,
} = require('../controllers/algorithmController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router
    .route('/')
    .get(getAlgorithms)
    .post(createAlgorithm);

router.route('/:id').delete(deleteAlgorithm);

module.exports = router;
