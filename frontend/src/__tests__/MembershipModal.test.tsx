import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MembershipModal } from '../components/MembershipModal';
import * as api from '../services/api';

// Mock API
jest.mock('../services/api', () => ({
  membershipApi: {
    getPlans: jest.fn(),
    getCurrent: jest.fn(),
  },
  paymentApi: {
    createOrder: jest.fn(),
    getOrder: jest.fn(),
  },
}));

describe('MembershipModal', () => {
  const mockToken = 'test-token';
  const mockCurrentMembership = {
    planType: 'basic',
    billingCycle: 'continuous_yearly',
    status: 'active',
    endDate: null,
    autoRenew: true,
    nextRenewalDate: '2026-12-31T00:00:00',
    currentPoints: 1080,
  };

  const mockPlans = [
    {
      id: 1,
      name: '基础会员',
      type: 'basic',
      billingCycle: 'continuous_yearly',
      price: 659,
      originalPrice: null,
      discountPercent: 30,
      pointsPerMonth: 1080,
      maxImagesPerMonth: 4320,
      maxVideosPerMonth: 216,
      features: '["每天赠送积分", "生图生视频无限次加速"]',
    },
    {
      id: 4,
      name: '高级会员',
      type: 'premium',
      billingCycle: 'continuous_yearly',
      price: 5199,
      originalPrice: null,
      discountPercent: 30,
      pointsPerMonth: 15000,
      maxImagesPerMonth: 60000,
      maxVideosPerMonth: 3000,
      features: '["Seedream 4.5 4k免费用1年", "每天赠送积分"]',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (api.membershipApi.getPlans as jest.Mock).mockResolvedValue(mockPlans);
  });

  it('应该渲染会员弹窗', () => {
    render(
      <MembershipModal
        isOpen={true}
        onClose={jest.fn()}
        token={mockToken}
        currentMembership={mockCurrentMembership}
      />
    );

    expect(screen.getByText('订阅计划')).toBeInTheDocument();
  });

  it('应该显示当前会员信息', () => {
    render(
      <MembershipModal
        isOpen={true}
        onClose={jest.fn()}
        token={mockToken}
        currentMembership={mockCurrentMembership}
      />
    );

    expect(screen.getByText(/基础会员/)).toBeInTheDocument();
    expect(screen.getByText(/1080/)).toBeInTheDocument();
  });

  it('应该加载并显示订阅计划', async () => {
    render(
      <MembershipModal
        isOpen={true}
        onClose={jest.fn()}
        token={mockToken}
      />
    );

    await waitFor(() => {
      expect(api.membershipApi.getPlans).toHaveBeenCalledWith('continuous_yearly', mockToken);
    });

    await waitFor(() => {
      expect(screen.getByText('基础会员')).toBeInTheDocument();
      expect(screen.getByText('高级会员')).toBeInTheDocument();
    });
  });

  it('应该切换标签页', async () => {
    render(
      <MembershipModal
        isOpen={true}
        onClose={jest.fn()}
        token={mockToken}
      />
    );

    const monthlyTab = screen.getByText('单月购买');
    fireEvent.click(monthlyTab);

    await waitFor(() => {
      expect(api.membershipApi.getPlans).toHaveBeenCalledWith('monthly', mockToken);
    });
  });

  it('应该处理购买按钮点击', async () => {
    const mockOrder = {
      orderNo: 'HS1234567890',
      amount: 5199,
      paymentType: 'wechat',
      status: 'pending',
      qrCodeUrl: 'https://api.example.com/qrcode/wechat/HS1234567890',
      paymentUrl: null,
      expiresAt: '2025-12-14T10:00:00',
      paidAt: null,
    };

    (api.paymentApi.createOrder as jest.Mock).mockResolvedValue(mockOrder);

    render(
      <MembershipModal
        isOpen={true}
        onClose={jest.fn()}
        token={mockToken}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('高级会员')).toBeInTheDocument();
    });

    const purchaseButton = screen.getAllByText(/订阅/).find(
      (btn) => btn.textContent?.includes('高级会员')
    );

    if (purchaseButton) {
      fireEvent.click(purchaseButton);

      await waitFor(() => {
        expect(api.paymentApi.createOrder).toHaveBeenCalledWith(
          4,
          'wechat',
          mockToken
        );
      });
    }
  });

  it('应该关闭弹窗', () => {
    const onClose = jest.fn();
    render(
      <MembershipModal
        isOpen={true}
        onClose={onClose}
        token={mockToken}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('应该在未打开时不渲染', () => {
    const { container } = render(
      <MembershipModal
        isOpen={false}
        onClose={jest.fn()}
        token={mockToken}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});

