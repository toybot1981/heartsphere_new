import { useState, useCallback } from 'react';
import { imageApi, type ImageUploadResponse, type ImageVariants } from '../../services/api';
import { showAlert } from '../../utils/dialog';

export const useImageUpload = (adminToken: string | null) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingBackground, setIsUploadingBackground] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const uploadImage = useCallback(async (
        file: File,
        category: string = 'general',
        onSuccess?: (url: string, variants?: ImageVariants) => void,
        isSystemResource: boolean = false
    ): Promise<{ url: string; variants?: ImageVariants } | undefined> => {
        if (!adminToken) {
            showAlert('请先登录', '错误', 'error');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        try {
            const response = await imageApi.uploadImage(file, category, adminToken, isSystemResource);
            if (response.success && response.url) {
                if (onSuccess) {
                    onSuccess(response.url, response.variants);
                }
                return { url: response.url, variants: response.variants };
            } else {
                throw new Error(response.error || '上传失败');
            }
        } catch (error: any) {
            const errorMsg = error.message || '图片上传失败';
            setUploadError(errorMsg);
            showAlert(errorMsg, '上传失败', 'error');
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, [adminToken]);

    const uploadAvatar = useCallback(async (
        file: File,
        onSuccess?: (url: string, variants?: ImageVariants) => void
    ) => {
        setIsUploadingAvatar(true);
        try {
            const result = await uploadImage(file, 'avatar', onSuccess);
            return result;
        } finally {
            setIsUploadingAvatar(false);
        }
    }, [uploadImage]);

    const uploadBackground = useCallback(async (
        file: File,
        onSuccess?: (url: string, variants?: ImageVariants) => void
    ) => {
        setIsUploadingBackground(true);
        try {
            const result = await uploadImage(file, 'background', onSuccess);
            return result;
        } finally {
            setIsUploadingBackground(false);
        }
    }, [uploadImage]);

    return {
        isUploading,
        isUploadingAvatar,
        isUploadingBackground,
        uploadError,
        uploadImage,
        uploadAvatar,
        uploadBackground,
    };
};


