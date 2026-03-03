import axios from 'axios';
import type { UploadResponse, OMRResponse } from '../types/music';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 min for OMR processing
});

export async function uploadSheet(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<UploadResponse>('/api/v1/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function processOMR(sheetId: string, pageNumber = 0): Promise<OMRResponse> {
  const res = await apiClient.post<OMRResponse>('/api/v1/omr/process', {
    sheet_id: sheetId,
    page_number: pageNumber,
  });
  return res.data;
}

export function getMidiUrl(sheetId: string): string {
  return `${BASE_URL}/api/v1/midi/${sheetId}`;
}

export function getAnnotatedImageUrl(sheetId: string): string {
  return `${BASE_URL}/api/v1/sheet/${sheetId}/annotated`;
}
