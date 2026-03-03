import { useState, useCallback } from 'react';
import { uploadSheet, processOMR, getAnnotatedImageUrl } from '../api/client';
import { useMusicStore } from '../store/musicStore';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export function useUpload() {
  const [stage, setStage] = useState<UploadStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const setSheetData = useMusicStore((s) => s.setSheetData);

  const processFile = useCallback(async (file: File) => {
    setStage('uploading');
    setError(null);

    try {
      // Step 1: Upload
      const uploadResult = await uploadSheet(file);

      // Step 2: OMR
      setStage('processing');
      const omrResult = await processOMR(uploadResult.sheet_id);

      if (omrResult.status === 'failed') {
        throw new Error(omrResult.error ?? 'OMR processing failed. Please try a cleaner scan.');
      }

      setSheetData({
        sheetId: omrResult.sheet_id,
        musicxml: omrResult.musicxml,
        notes: omrResult.notes,
        metadata: omrResult.metadata,
        annotatedImageUrl: getAnnotatedImageUrl(omrResult.sheet_id),
      });

      setStage('done');
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        'Something went wrong. Please try again.';
      setError(msg);
      setStage('error');
    }
  }, [setSheetData]);

  const reset = useCallback(() => {
    setStage('idle');
    setError(null);
  }, []);

  return { stage, error, processFile, reset };
}
