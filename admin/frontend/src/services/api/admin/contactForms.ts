// 管理后台联系表单 API
import { request } from "../request";

export interface ContactForm {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  message: string;
  isProcessed: boolean;
  processNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormPage {
  content: ContactForm[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminContactFormsApi = {
  /**
   * 获取所有联系表单（分页）
   */
  async getAllContactForms(
    page: number = 0,
    size: number = 20,
    unprocessed?: boolean,
    token?: string
  ): Promise<ContactFormPage> {
    let url = `/api/admin/contact-forms?page=${page}&size=${size}`;
    if (unprocessed !== undefined) {
      url += `&unprocessed=${unprocessed}`;
    }
    
    const response = await request<ContactFormPage>(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    return response;
  },

  /**
   * 获取单个联系表单详情
   */
  async getContactFormById(id: number, token?: string): Promise<ContactForm> {
    const response = await request<ContactForm>(`/api/admin/contact-forms/${id}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    return response;
  },

  /**
   * 标记联系表单为已处理
   */
  async markAsProcessed(
    id: number,
    processNotes: string,
    token?: string
  ): Promise<ContactForm> {
    const response = await request<ContactForm>(`/api/admin/contact-forms/${id}/mark-processed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ processNotes }),
    });
    
    return response;
  },
};
