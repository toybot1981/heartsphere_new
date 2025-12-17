import { membershipApi, paymentApi } from '../services/api';

// Mock fetch
global.fetch = jest.fn();

describe('Membership API', () => {
  const mockToken = 'test-token';
  const mockBaseUrl = 'http://localhost:8081/api';

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getCurrent', () => {
    it('应该获取当前会员信息', async () => {
      const mockMembership = {
        id: 1,
        planType: 'premium',
        billingCycle: 'continuous_yearly',
        status: 'active',
        startDate: '2025-01-01T00:00:00',
        endDate: null,
        autoRenew: true,
        nextRenewalDate: '2026-01-01T00:00:00',
        currentPoints: 15000,
        totalPointsEarned: 15000,
        totalPointsUsed: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembership,
      });

      const result = await membershipApi.getCurrent(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/membership/current`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockMembership);
    });

    it('应该处理错误响应', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(membershipApi.getCurrent(mockToken)).rejects.toThrow();
    });
  });

  describe('getPlans', () => {
    it('应该获取所有计划', async () => {
      const mockPlans = [
        {
          id: 1,
          name: '基础会员',
          type: 'basic',
          billingCycle: 'continuous_yearly',
          price: 659,
          pointsPerMonth: 1080,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlans,
      });

      const result = await membershipApi.getPlans(undefined, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/membership/plans`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockPlans);
    });

    it('应该根据计费周期获取计划', async () => {
      const mockPlans = [
        {
          id: 4,
          name: '高级会员',
          type: 'premium',
          billingCycle: 'continuous_yearly',
          price: 5199,
          pointsPerMonth: 15000,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlans,
      });

      const result = await membershipApi.getPlans('continuous_yearly', mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/membership/plans?billingCycle=continuous_yearly`,
        expect.anything()
      );
      expect(result).toEqual(mockPlans);
    });
  });
});

describe('Payment API', () => {
  const mockToken = 'test-token';
  const mockBaseUrl = 'http://localhost:8081/api';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('应该创建支付订单', async () => {
      const mockOrder = {
        orderNo: 'HS1234567890',
        amount: 5199,
        paymentType: 'wechat',
        status: 'pending',
        qrCodeUrl: 'https://api.example.com/qrcode/wechat/HS1234567890',
        paymentUrl: null,
        expiresAt: '2025-12-14T10:00:00',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      });

      const result = await paymentApi.createOrder(4, 'wechat', mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/payment/create`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId: 4, paymentType: 'wechat' }),
        })
      );
      expect(result).toEqual(mockOrder);
    });

    it('应该处理创建订单失败', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      await expect(paymentApi.createOrder(4, 'wechat', mockToken)).rejects.toThrow();
    });
  });

  describe('getOrder', () => {
    it('应该查询订单状态', async () => {
      const mockOrder = {
        orderNo: 'HS1234567890',
        amount: 5199,
        paymentType: 'wechat',
        status: 'paid',
        qrCodeUrl: null,
        paymentUrl: null,
        expiresAt: '2025-12-14T10:00:00',
        paidAt: '2025-12-14T09:30:00',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      });

      const result = await paymentApi.getOrder('HS1234567890', mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/payment/order/HS1234567890`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockOrder);
    });
  });
});

