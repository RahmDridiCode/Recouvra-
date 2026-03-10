jest.mock('../../src/models/User');
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'tok') }));

const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const { login } = require('../../src/controllers/authController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController.login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns token and user on success', async () => {
    const req = { body: { email: 'a@a.com', password: 'pass' } };
    const user = { _id: 'u1', name: 'U', email: 'a@a.com', role: 'admin', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(user);

    const res = mockRes();
    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'a@a.com' });
    expect(user.comparePassword).toHaveBeenCalledWith('pass');
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'tok', user: expect.any(Object) }));
  });

  it('returns 400 when user not found', async () => {
    const req = { body: { email: 'x@x.com', password: 'p' } };
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('returns 400 when password invalid', async () => {
    const req = { body: { email: 'a@a.com', password: 'p' } };
    const user = { comparePassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockResolvedValue(user);
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });
});
