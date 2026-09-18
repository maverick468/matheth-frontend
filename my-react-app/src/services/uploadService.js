import apiClient from './apiClient';

export const uploadService = {
  async uploadPdf(file, onUploadProgress) {
    const formData = new FormData();
    // Change 'file' to 'document' if your backend route uses uploadMiddleware.single('document')
    formData.append('document', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }
};