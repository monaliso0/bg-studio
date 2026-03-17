export type MultiItemStage = "queued" | "removing" | "done" | "error";

export type MultiItem = {
  id: string;
  file: File;
  naturalWidth: number;
  naturalHeight: number;
  stage: MultiItemStage;
  processedBlob: Blob | null;
  composedUrl: string | null;
};
