jest.mock('../../src/models/Payment');
jest.mock('../../src/models/Invoice');
jest.mock('../../src/models/Client');

const Payment = require('../../src/models/Payment');
const Invoice = require('../../src/models/Invoice');
const Client = require('../../src/models/Client');
const { createPayment, listPayments, updatePayment } = require('../../src/controllers/paymentController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('paymentController', () => {
    beforeEach(() => jest.clearAllMocks());

    it('createPayment - success', async () => {
        const invoice = { _id: 'i1', amount: 100, save: jest.fn().mockResolvedValue(true) };
        Invoice.findById.mockResolvedValue(invoice);

        const pay = { _id: 'p1', invoice: 'i1', save: jest.fn().mockResolvedValue(true) };
        Payment.mockImplementation(() => pay);

        const req = { body: { invoice: 'i1', amount: 100 } };
        const res = mockRes();

        await createPayment(req, res);

        expect(Invoice.findById).toHaveBeenCalledWith('i1');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'p1' }));
    });

    it('createPayment - invoice not found', async () => {
        Invoice.findById.mockResolvedValue(null);
        const req = { body: { invoice: 'x', amount: 10 } };
        const res = mockRes();

        await createPayment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invoice not found' });
    });

    it('createPayment - amount mismatch', async () => {
        const invoice = { _id: 'i1', amount: 50 };
        Invoice.findById.mockResolvedValue(invoice);

        const req = { body: { invoice: 'i1', amount: 10 } };
        const res = mockRes();

        await createPayment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Payment amount must be exactly') });
    });

    it('listPayments - admin sees all', async () => {
        const payments = [{ _id: 'p1' }, { _id: 'p2' }];

        // Mock chain find().populate()
        Payment.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(payments),
        });

        const req = { user: { role: 'admin' } };
        const res = mockRes();

        await listPayments(req, res);

        expect(Payment.find).toHaveBeenCalledWith({});
        expect(res.json).toHaveBeenCalledWith(payments);
    });

    it('updatePayment - payment not found', async () => {
        Payment.findByIdAndUpdate.mockResolvedValue(null);

        const req = { params: { id: 'p1' }, body: {} };
        const res = mockRes();

        await updatePayment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Payment not found' });
    });

    it('updatePayment - invoice not found', async () => {
        const payment = { _id: 'p1', invoice: 'i1' };
        Payment.findByIdAndUpdate.mockResolvedValue(payment);
        Invoice.findById.mockResolvedValue(null);

        const req = { params: { id: 'p1' }, body: {} };
        const res = mockRes();

        await updatePayment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invoice not found' });
    });

    it('updatePayment - success updates invoice status', async () => {
        const payment = { _id: 'p1', invoice: 'i1' };
        const invoice = { _id: 'i1', save: jest.fn().mockResolvedValue(true) };

        Payment.findByIdAndUpdate.mockResolvedValue(payment);
        Invoice.findById.mockResolvedValue(invoice);

        const req = { params: { id: 'p1' }, body: { status: 'paid' } };
        const res = mockRes();

        await updatePayment(req, res);

        expect(invoice.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ payment, invoice }));
    });
});