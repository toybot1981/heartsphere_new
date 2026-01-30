import { request } from '../request';

/**
 * 自动修复记录
 */
export interface AutoFixRecord {
    id: number;
    pipelineExecutionId: number;
    problemType: 'CODE_QUALITY' | 'TEST_FAILURE' | 'BUILD_FAILURE' | 'DEPLOYMENT_FAILURE' | 'CONFIGURATION';
    problemDescription: string;
    problemDetails?: string;
    fixSolution?: string;
    fixDetails?: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'PENDING' | 'PROPOSED' | 'APPROVED' | 'APPLIED' | 'VERIFIED' | 'FAILED' | 'REJECTED' | 'ROLLED_BACK';
    beforeState?: string;
    afterState?: string;
    fixEffective?: boolean;
    verificationResult?: string;
    approvedBy?: number;
    approvedAt?: string;
    appliedAt?: string;
    verifiedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

/**
 * 自动修复 API
 */
export const adminAutoFixApi = {
    /**
     * 检测并修复流程执行中的问题
     */
    detectAndFix: async (token: string, executionId: number): Promise<AutoFixRecord[]> => {
        return request<AutoFixRecord[]>(`/devops/auto-fix/detect-and-fix/${executionId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    /**
     * 获取修复记录列表
     */
    getFixRecords: async (
        token: string,
        executionId?: number,
        status?: string
    ): Promise<AutoFixRecord[]> => {
        const params = new URLSearchParams();
        if (executionId) params.append('executionId', executionId.toString());
        if (status) params.append('status', status);

        return request<AutoFixRecord[]>(`/devops/auto-fix/records?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    /**
     * 获取修复记录详情
     */
    getFixRecord: async (token: string, id: number): Promise<AutoFixRecord> => {
        return request<AutoFixRecord>(`/devops/auto-fix/records/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    /**
     * 批准修复
     */
    approveFix: async (token: string, id: number, approvedBy: number): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>(`/devops/auto-fix/records/${id}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ approvedBy }),
        });
    },

    /**
     * 拒绝修复
     */
    rejectFix: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>(`/devops/auto-fix/records/${id}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    /**
     * 验证修复
     */
    verifyFix: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>(`/devops/auto-fix/records/${id}/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    /**
     * 回滚修复
     */
    rollbackFix: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>(`/devops/auto-fix/records/${id}/rollback`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};
