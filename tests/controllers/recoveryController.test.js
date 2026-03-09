jest.mock('../../src/models/RecoveryAction');

const RecoveryAction = require('../../src/models/RecoveryAction');
const { createAction, listActions } = require('../../src/controllers/recoveryController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('recoveryController', () => {
  beforeEach(() => jest.clearAllMocks());

    it('listActions - success for admin', async () => {
        const mockActions = [{ _id: 'a1', note: 'n' }];
        const populateMock = jest.fn().mockResolvedValue(mockActions);
        RecoveryAction.find.mockReturnValue({ populate: populateMock });

        const req = { user: { role: 'admin' } };
        const res = mockRes();

        await listActions(req, res);

        expect(RecoveryAction.find).toHaveBeenCalledWith({});
        expect(populateMock).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockActions);
    });

  it('createAction - error', async () => {
    RecoveryAction.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error('bad')) }));
    const req = { body: {} };
    const res = mockRes();
    await createAction(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'bad' });
  });


});
