import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

/**
 * 联系表单组件
 * 表单字段：姓名、邮箱、电话、公司、咨询内容
 * 表单验证、提交按钮和加载状态
 */
export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '电话不能为空';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '电话格式不正确（请输入11位手机号）';
    }

    if (!formData.message.trim()) {
      newErrors.message = '咨询内容不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: 替换为实际的后端API端点
      const response = await fetch('/api/company/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('提交表单失败:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    // 清除该字段的错误
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 border border-neutral-200" role="form" aria-label="联系表单">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange('name')}
            className={`w-full px-4 py-2 bg-white border rounded-lg text-neutral-900 focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:ring-primary-300 focus:border-primary-500'
            }`}
            placeholder="请输入您的姓名"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
            邮箱 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange('email')}
            className={`w-full px-4 py-2 bg-white border rounded-lg text-neutral-900 focus:outline-none focus:ring-2 ${
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:ring-primary-300 focus:border-primary-500'
            }`}
            placeholder="example@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
            电话 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleChange('phone')}
            className={`w-full px-4 py-2 bg-white border rounded-lg text-neutral-900 focus:outline-none focus:ring-2 ${
              errors.phone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:ring-primary-300 focus:border-primary-500'
            }`}
            placeholder="请输入11位手机号"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-2">
            公司（可选）
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={handleChange('company')}
            className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            placeholder="请输入公司名称"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
            咨询内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={handleChange('message')}
            rows={5}
            className={`w-full px-4 py-2 bg-white border rounded-lg text-neutral-900 focus:outline-none focus:ring-2 ${
              errors.message
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:ring-primary-300 focus:border-primary-500'
            }`}
            placeholder="请描述您的需求或问题..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>

        {submitStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            提交成功！我们会尽快与您联系。
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            提交失败，请稍后重试或直接联系我们。
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '提交咨询'}
        </button>
      </form>
    </div>
  );
};
