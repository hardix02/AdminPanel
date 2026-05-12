const express = require('express');
const {
    getAlgoAccessList,
    createAlgoAccess,
    updateAlgoAccess,
    toggleAlgoAccessStatus,
    extendAlgoAccess,
    deleteAlgoAccess,
    getAlgoAccessDetails,
} = require('../controllers/algoAccessController');
const { protect, authorize } = require('../middleware/auth');

// Authenticated routes
const authRouter = express.Router();
authRouter.use(protect);
authRouter.use(authorize('admin', 'superadmin'));

authRouter
    .route('/')
    .get(getAlgoAccessList)
    .post(createAlgoAccess);

authRouter.patch('/:id/toggle-status', toggleAlgoAccessStatus);
authRouter.patch('/:id/extend', extendAlgoAccess);
    
authRouter
    .route('/:id')
    .put(updateAlgoAccess)
    .delete(deleteAlgoAccess);

// Public routes
const publicRouter = express.Router();
publicRouter.get('/:accountId/:algoName', (req, res, next) => {
    console.log('Public route hit:', req.params);
    next();
}, getAlgoAccessDetails);

module.exports = {
    authAlgoAccessRouter: authRouter,
    publicAlgoAccessRouter: publicRouter,
};
