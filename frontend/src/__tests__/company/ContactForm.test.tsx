/**
 * 联系表单组件测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContactForm } from '../../../components/company/ContactForm';

// Mock fetch
global.fetch = jest.fn();

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, message: '成功', data: { success: true } }),
    });
  });

  it('应该渲染联系表单', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/姓名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/邮箱/)).toBeInTheDocument();
    expect(screen.getByLabelText(/电话/)).toBeInTheDocument();
    expect(screen.getByLabelText(/咨询内容/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /提交咨询/ })).toBeInTheDocument();
  });

  it('应该显示验证错误当字段为空', async () => {
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /提交咨询/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/姓名不能为空/)).toBeInTheDocument();
    });
  });

  it('应该验证邮箱格式', async () => {
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/邮箱/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /提交咨询/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/邮箱格式不正确/)).toBeInTheDocument();
    });
  });

  it('应该验证电话格式', async () => {
    render(<ContactForm />);

    const phoneInput = screen.getByLabelText(/电话/);
    fireEvent.change(phoneInput, { target: { value: '123456789' } });

    const submitButton = screen.getByRole('button', { name: /提交咨询/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/电话格式不正确/)).toBeInTheDocument();
    });
  });

  it('应该成功提交表单', async () => {
    render(<ContactForm />);

    // 填写表单
    fireEvent.change(screen.getByLabelText(/姓名/), { target: { value: '测试用户' } });
    fireEvent.change(screen.getByLabelText(/邮箱/), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/电话/), { target: { value: '13800138000' } });
    fireEvent.change(screen.getByLabelText(/咨询内容/), { target: { value: '测试咨询内容' } });

    const submitButton = screen.getByRole('button', { name: /提交咨询/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/company/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '测试用户',
          email: 'test@example.com',
          phone: '13800138000',
          company: '',
          message: '测试咨询内容',
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/提交成功/)).toBeInTheDocument();
    });
  });

  it('应该处理提交失败', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ code: 500, message: '服务器错误' }),
    });

    render(<ContactForm />);

    // 填写表单
    fireEvent.change(screen.getByLabelText(/姓名/), { target: { value: '测试用户' } });
    fireEvent.change(screen.getByLabelText(/邮箱/), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/电话/), { target: { value: '13800138000' } });
    fireEvent.change(screen.getByLabelText(/咨询内容/), { target: { value: '测试咨询内容' } });

    const submitButton = screen.getByRole('button', { name: /提交咨询/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/提交失败/)).toBeInTheDocument();
    });
  });
});
