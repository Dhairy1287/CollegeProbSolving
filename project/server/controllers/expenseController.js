const { ExpenseGroup, Expense } = require('../models/Expense');
const DirectExpense = require('../models/DirectExpense');
const User = require('../models/User');

// ─── Groups ─────────────────────────────────────────────────────────────────

exports.createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const members = [req.user._id.toString(), ...(memberIds || [])];
        const unique = [...new Set(members)];
        const group = await ExpenseGroup.create({ name, members: unique, createdBy: req.user._id, college: req.user.college });
        res.status(201).json({ success: true, group });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyGroups = async (req, res) => {
    try {
        const groups = await ExpenseGroup.find({ members: req.user._id }).populate('members', 'name email avatar');
        res.json({ success: true, groups });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await ExpenseGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (group.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only group creator can delete the group' });
        }
        // Delete all expenses in this group
        await Expense.deleteMany({ group: group._id });
        await ExpenseGroup.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Group and all associated expenses deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── Expenses ────────────────────────────────────────────────────────────────

exports.addExpense = async (req, res) => {
    try {
        const { groupId, description, amount, splitAmong, splitType, customSplits } = req.body;
        const expense = await Expense.create({
            group: groupId, description, amount,
            paidBy: req.user._id, splitAmong, splitType, customSplits,
        });
        await expense.populate('paidBy splitAmong', 'name avatar');
        res.status(201).json({ success: true, expense });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getGroupExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ group: req.params.groupId })
            .populate('paidBy splitAmong', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ success: true, expenses });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateExpense = async (req, res) => {
    try {
        const { description, amount } = req.body;
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { ...(description && { description }), ...(amount && { amount: parseFloat(amount) }) },
            { new: true }
        ).populate('paidBy splitAmong', 'name avatar');
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, expense });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Expense deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id).populate('paidBy splitAmong', 'name avatar email');
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, expense });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── Direct 1-to-1 Transactions ─────────────────────────────────────────────

exports.addDirectTransaction = async (req, res) => {
    try {
        const { toUserId, toUserEmail, amount, description } = req.body;
        let toId = toUserId;
        if (!toId && toUserEmail) {
            const toUser = await User.findOne({ email: toUserEmail.trim().toLowerCase() });
            if (!toUser) return res.status(404).json({ success: false, message: `No user found with email: ${toUserEmail}` });
            toId = toUser._id;
        }
        if (!toId) return res.status(400).json({ success: false, message: 'Provide toUserId or toUserEmail' });
        const tx = await DirectExpense.create({
            from: req.user._id, to: toId,
            amount: parseFloat(amount), description,
            college: req.user.college,
        });
        await tx.populate('from to', 'name avatar email');
        res.status(201).json({ success: true, transaction: tx });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getDirectTransactions = async (req, res) => {
    try {
        const txs = await DirectExpense.find({
            $or: [{ from: req.user._id }, { to: req.user._id }]
        }).populate('from to', 'name avatar').sort({ createdAt: -1 });
        res.json({ success: true, transactions: txs });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateDirectTransaction = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const tx = await DirectExpense.findByIdAndUpdate(
            req.params.id,
            { ...(amount && { amount: parseFloat(amount) }), ...(description && { description }) },
            { new: true }
        ).populate('from to', 'name avatar');
        res.json({ success: true, transaction: tx });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteDirectTransaction = async (req, res) => {
    try {
        await DirectExpense.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Transaction deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getDirectTransactionById = async (req, res) => {
    try {
        const tx = await DirectExpense.findById(req.params.id).populate('from to', 'name avatar email phone');
        if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
        res.json({ success: true, transaction: tx });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.settleDirectTransaction = async (req, res) => {
    try {
        const tx = await DirectExpense.findByIdAndUpdate(req.params.id, { settled: true }, { new: true }).populate('from to', 'name avatar');
        res.json({ success: true, transaction: tx });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── Debt Simplification Algorithm ──────────────────────────────────────────

exports.simplifyDebts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ group: groupId, settled: false })
            .populate('paidBy splitAmong', 'name avatar _id');

        const balances = {};

        for (const exp of expenses) {
            const paidById = exp.paidBy._id.toString();
            const total = exp.amount;

            if (exp.splitType === 'equal') {
                const share = total / exp.splitAmong.length;
                for (const member of exp.splitAmong) {
                    const mid = member._id.toString();
                    balances[paidById] = (balances[paidById] || 0) + share;
                    balances[mid] = (balances[mid] || 0) - share;
                }
            } else {
                for (const cs of exp.customSplits) {
                    const mid = cs.user.toString();
                    balances[paidById] = (balances[paidById] || 0) + cs.amount;
                    balances[mid] = (balances[mid] || 0) - cs.amount;
                }
            }
        }

        let creditors = [], debtors = [];
        for (const [userId, balance] of Object.entries(balances)) {
            if (balance > 0.01) creditors.push({ userId, amount: balance });
            else if (balance < -0.01) debtors.push({ userId, amount: -balance });
        }

        const transactions = [];
        let i = 0, j = 0;
        while (i < creditors.length && j < debtors.length) {
            const settle = Math.min(creditors[i].amount, debtors[j].amount);
            transactions.push({ from: debtors[j].userId, to: creditors[i].userId, amount: +settle.toFixed(2) });
            creditors[i].amount -= settle;
            debtors[j].amount -= settle;
            if (creditors[i].amount < 0.01) i++;
            if (debtors[j].amount < 0.01) j++;
        }

        const group = await ExpenseGroup.findById(groupId).populate('members', 'name avatar _id');
        const userMap = {};
        group.members.forEach(m => { userMap[m._id.toString()] = { name: m.name, avatar: m.avatar }; });

        const enriched = transactions.map(t => ({
            from: { id: t.from, ...userMap[t.from] },
            to: { id: t.to, ...userMap[t.to] },
            amount: t.amount,
        }));

        res.json({ success: true, simplifiedDebts: enriched });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.settleExpense = async (req, res) => {
    try {
        await Expense.findByIdAndUpdate(req.params.id, { settled: true });
        res.json({ success: true, message: 'Expense settled' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
