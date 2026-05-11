const express = require('express');
const {
    getAlgoAccessList,
    createAlgoAccess,
    updateAlgoAccess,
    toggleAlgoAccessStatus,
    extendAlgoAccess,
    algoAccessRoutes,
    deleteAlgoAccess,
} = require('../controllers/algoAccessController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router
    .route('/')
    .get(getAlgoAccessList)
    .post(createAlgoAccess);

router.patch('/:id/toggle-status', toggleAlgoAccessStatus);
router.patch('/:id/extend', extendAlgoAccess);

router.get('/check-access', checkAlgoAccess);

router
    .route('/:id')
    .put(updateAlgoAccess)
    .delete(deleteAlgoAccess);

module.exports = router;
