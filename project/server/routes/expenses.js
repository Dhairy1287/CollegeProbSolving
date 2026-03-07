const router = require('express').Router();
const {
    createGroup, getMyGroups, addExpense, getGroupExpenses,
    simplifyDebts, settleExpense, updateExpense, deleteExpense,
    addDirectTransaction, getDirectTransactions, updateDirectTransaction,
    deleteDirectTransaction, settleDirectTransaction,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// Groups
router.post('/groups', protect, createGroup);
router.get('/groups', protect, getMyGroups);
router.delete('/groups/:id', protect, require('../controllers/expenseController').deleteGroup);

// Group Expenses
router.post('/add', protect, addExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.patch('/:id', protect, updateExpense);
router.get('/:id', protect, require('../controllers/expenseController').getExpenseById);
router.delete('/:id', protect, deleteExpense);
router.get('/simplify/:groupId', protect, simplifyDebts);
router.patch('/:id/settle', protect, settleExpense);

// Direct 1-to-1 Transactions
router.post('/direct', protect, addDirectTransaction);
router.get('/direct', protect, getDirectTransactions);
router.patch('/direct/:id', protect, updateDirectTransaction);
router.get('/direct/:id', protect, require('../controllers/expenseController').getDirectTransactionById);
router.delete('/direct/:id', protect, deleteDirectTransaction);
router.patch('/direct/:id/settle', protect, settleDirectTransaction);

module.exports = router;
