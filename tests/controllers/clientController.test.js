jest.mock('../../src/models/Client');

const Client = require('../../src/models/Client');
const { createClient, listClients, updateClient, deleteClient } = require('../../src/controllers/clientController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('clientController', () => {
  beforeEach(() => jest.clearAllMocks());

    it('createClient - success', async () => {
        const payload = { name: 'C' };
        
        const mockClientInstance = {
            ...payload,
            _id: 'c1',
            save: jest.fn().mockResolvedValue(true) 
        };
        Client.mockImplementation(() => mockClientInstance);

        const req = { body: payload };
        const res = mockRes();

        await createClient(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockClientInstance); 
    });
    
  it('createClient - error', async () => {
    Client.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error('fail')) }));
    const req = { body: {} };
    const res = mockRes();
    await createClient(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'fail' });
  });

  it('listClients - admin returns all', async () => {
    const clients = [{ name: 'a' }];
    Client.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(clients) });
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    await listClients(req, res);
    expect(Client.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(clients);
  });

  it('listClients - agent filters assignedTo', async () => {
    const clients = [{ name: 'b' }];
    Client.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(clients) });
    const req = { user: { role: 'agent', _id: 'agent1' } };
    const res = mockRes();
    await listClients(req, res);
    expect(Client.find).toHaveBeenCalledWith({ assignedTo: 'agent1' });
    expect(res.json).toHaveBeenCalledWith(clients);
  });

  it('updateClient - not found', async () => {
    Client.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: 'x' }, body: {} };
    const res = mockRes();
    await updateClient(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });

  it('updateClient - success', async () => {
    const updated = { _id: 'x', name: 'updated' };
    Client.findByIdAndUpdate.mockResolvedValue(updated);
    const req = { params: { id: 'x' }, body: { name: 'updated' } };
    const res = mockRes();
    await updateClient(req, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('deleteClient - success', async () => {
    Client.findByIdAndDelete.mockResolvedValue();
    const req = { params: { id: 'x' } };
    const res = mockRes();
    await deleteClient(req, res);
    expect(Client.findByIdAndDelete).toHaveBeenCalledWith('x');
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
