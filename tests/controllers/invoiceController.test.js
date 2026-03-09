jest.mock('../../src/models/Invoice');
jest.mock('../../src/models/Client');

const Invoice = require('../../src/models/Invoice');
const Client = require('../../src/models/Client');
const { createInvoice, listInvoices, updateInvoice, deleteInvoice } = require('../../src/controllers/invoiceController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('invoiceController', () => {
    beforeEach(() => jest.clearAllMocks());

    it('createInvoice - success', async () => {
        const mockSave = jest.fn().mockResolvedValue(true);
        const invoiceInstance = { _id: 'i1', save: mockSave };
        Invoice.mockImplementation(() => invoiceInstance);

        const req = { body: { amount: 100 } };
        const res = mockRes();

        await createInvoice(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'i1' }));
    });

    it('createInvoice - error', async () => {
        const mockSave = jest.fn().mockRejectedValue(new Error('err'));
        const invoiceInstance = { save: mockSave };
        Invoice.mockImplementation(() => invoiceInstance);

        const req = { body: {} };
        const res = mockRes();

        await createInvoice(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'err' });
    });

    it('listInvoices - admin returns all', async () => {
        const invoices = [{ _id: 'i1' }];
      
        Invoice.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(invoices) });

        const req = { user: { role: 'admin' } };
        const res = mockRes();

        await listInvoices(req, res);

        expect(Invoice.find).toHaveBeenCalledWith({});
        expect(res.json).toHaveBeenCalledWith(invoices);
    });

    it('listInvoices - agent filters by client', async () => {
        const clients = [{ _id: 'c1' }];
        const mockInvoices = [{ _id: 'i1', amount: 100 }, { _id: 'i2', amount: 200 }];
      
        Client.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(clients)
        });

        Invoice.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockInvoices) });

        const req = { user: { role: 'agent', _id: 'a1' } };
        const res = mockRes();

        await listInvoices(req, res);

        expect(Client.find).toHaveBeenCalledWith({ assignedTo: 'a1' });
        expect(Invoice.find).toHaveBeenCalledWith({ client: { $in: clients.map(c => c._id) } });
        expect(res.json).toHaveBeenCalledWith(mockInvoices);
        
    });

    it('updateInvoice - not found', async () => {
        Invoice.findByIdAndUpdate.mockResolvedValue(null);

        const req = { params: { id: 'x' }, body: {} };
        const res = mockRes();

        await updateInvoice(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('updateInvoice - success', async () => {
        const updated = { _id: 'x' };
        Invoice.findByIdAndUpdate.mockResolvedValue(updated);

        const req = { params: { id: 'x' }, body: {} };
        const res = mockRes();

        await updateInvoice(req, res);

        expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('deleteInvoice - success', async () => {
        Invoice.findByIdAndDelete.mockResolvedValue({});
        const req = { params: { id: 'x' } };
        const res = mockRes();

        await deleteInvoice(req, res);

        expect(Invoice.findByIdAndDelete).toHaveBeenCalledWith('x');
        expect(res.json).toHaveBeenCalledWith({ ok: true });
    });
});