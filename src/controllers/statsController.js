const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const RecoveryAction = require('../models/RecoveryAction');
const User = require('../models/User');

async function stats(req, res) {
  try {
    // Basic invoice stats
    const totalInvoices = await Invoice.countDocuments();
    const paid = await Invoice.countDocuments({ status: 'paid' });
    const unpaid = await Invoice.countDocuments({ status: 'unpaid' });
    const overdue = await Invoice.countDocuments({ status: 'overdue' });

    // Clients
    const totalClients = await Client.countDocuments();

    // Payments
    const totalPayments = await Payment.countDocuments();
    const recoveredAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRecoveredAmount = recoveredAgg.length > 0 ? recoveredAgg[0].total : 0;

    // Amount still unpaid
    const unpaidAgg = await Invoice.aggregate([
      { $match: { status: { $in: ['unpaid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const amountStillUnpaid = unpaidAgg.length > 0 ? unpaidAgg[0].total : 0;

    // Recovery actions count
    const totalRecoveryActions = await RecoveryAction.countDocuments();

    // Stats per agent
    const agents = await User.find({ role: 'agent' }).select('_id name email');
    const statsPerAgent = [];
    for (const agent of agents) {
      const clients = await Client.find({ assignedTo: agent._id }).select('_id');
      const clientIds = clients.map(c => c._id);
      const agentInvoices = await Invoice.find({ client: { $in: clientIds } });
      const invoiceIds = agentInvoices.map(i => i._id);

      const agentTotalInvoices = agentInvoices.length;
      const agentPaid = agentInvoices.filter(i => i.status === 'paid').length;
      const agentUnpaid = agentInvoices.filter(i => i.status === 'unpaid').length;
      const agentOverdue = agentInvoices.filter(i => i.status === 'overdue').length;

      const agentPayments = await Payment.aggregate([
        { $match: { invoice: { $in: invoiceIds } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      const agentRecoveryActions = await RecoveryAction.countDocuments({ invoice: { $in: invoiceIds } });

      statsPerAgent.push({
        agent: { id: agent._id, name: agent.name, email: agent.email },
        clients: clientIds.length,
        totalInvoices: agentTotalInvoices,
        paid: agentPaid,
        unpaid: agentUnpaid,
        overdue: agentOverdue,
        totalPayments: agentPayments.length > 0 ? agentPayments[0].count : 0,
        recoveredAmount: agentPayments.length > 0 ? agentPayments[0].total : 0,
        recoveryActions: agentRecoveryActions
      });
    }

    // Stats per month (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const invoicesPerMonth = await Invoice.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          unpaid: { $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const paymentsPerMonth = await Payment.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const statsPerMonth = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const invData = invoicesPerMonth.find(x => x._id.year === year && x._id.month === month);
      const payData = paymentsPerMonth.find(x => x._id.year === year && x._id.month === month);
      statsPerMonth.push({
        year,
        month,
        invoices: invData ? invData.total : 0,
        invoiceAmount: invData ? invData.totalAmount : 0,
        paid: invData ? invData.paid : 0,
        unpaid: invData ? invData.unpaid : 0,
        overdue: invData ? invData.overdue : 0,
        payments: payData ? payData.total : 0,
        paymentAmount: payData ? payData.totalAmount : 0
      });
    }

    res.json({
      totalInvoices,
      paid,
      unpaid,
      overdue,
      totalClients,
      totalPayments,
      totalRecoveredAmount,
      amountStillUnpaid,
      totalRecoveryActions,
      statsPerAgent,
      statsPerMonth
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { stats };
