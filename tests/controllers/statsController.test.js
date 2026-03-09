jest.mock('../../src/models/Invoice');

const Invoice = require('../../src/models/Invoice');
const { stats } = require('../../src/controllers/statsController');

const mockRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('statsController.stats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns counts', async () => {
    Invoice.countDocuments
      .mockResolvedValueOnce(10) 
      .mockResolvedValueOnce(4) 
      .mockResolvedValueOnce(5) 
      .mockResolvedValueOnce(1); 

    const req = {};
    const res = mockRes();
    await stats(req, res);
    expect(Invoice.countDocuments).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ totalInvoices: 10, unpaid: 4, paid: 5, overdue: 1 });
  });

  it('propagates db errors as rejected promise', async () => {
    Invoice.countDocuments.mockRejectedValue(new Error('db'));
    const req = {};
    const res = mockRes();
    await expect(stats(req, res)).rejects.toThrow('db');
  });
});
