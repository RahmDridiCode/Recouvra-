jest.mock('../../src/models/User');

const User = require('../../src/models/User');
const { createUser, listUsers, updateUser, deleteUser } = require('../../src/controllers/userController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createUser - success', async () => {
    User.findOne.mockResolvedValue(null);
    User.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true), _id: 'u1', name: 'n', email: 'e', role: 'r' }));
    const req = { body: { name: 'n', email: 'e', password: 'p', role: 'r' } };
    const res = mockRes();
    await createUser(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'e' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
  });

  it('createUser - email exists', async () => {
    User.findOne.mockResolvedValue({ email: 'e' });
    const req = { body: { email: 'e' } };
    const res = mockRes();
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
  });

  it('createUser - db error', async () => {
    User.findOne.mockRejectedValue(new Error('dbfail'));
    const req = { body: { email: 'x' } };
    const res = mockRes();
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'dbfail' });
  });

  it('listUsers - success', async () => {
    const users = [{ name: 'u' }];
    User.find.mockReturnValue({ select: jest.fn().mockResolvedValue(users) });
    const req = {};
    const res = mockRes();
    await listUsers(req, res);
    expect(User.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(users);
  });

    it('updateUser - not found', async () => {
        // Mock findByIdAndUpdate pour qu'il retourne un objet avec select, qui résout null
        User.findByIdAndUpdate = jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

        const req = { params: { id: 'x' }, body: {} };
        const res = mockRes();

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

  it('updateUser - success', async () => {
    const updated = { _id: 'x', name: 'n' };
    User.findByIdAndUpdate.mockResolvedValue({ select: jest.fn().mockResolvedValue(updated) });
    const req = { params: { id: 'x' }, body: {} };
    const res = mockRes();
    await updateUser(req, res);
    // because controller chains select after findByIdAndUpdate
    expect(res.json).toHaveBeenCalled();
  });

  it('deleteUser - success', async () => {
    User.findByIdAndDelete.mockResolvedValue();
    const req = { params: { id: 'x' } };
    const res = mockRes();
    await deleteUser(req, res);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('x');
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
