// =====================================================
// SOCIALFLOW - Upload Service
// =====================================================

import { API_URL } from './api';

export interface UploadResponse {
  url: string;
  public_id: string;
  media_type: string;
}

/**
 * Sube un archivo al servidor (imagen o video).
 * Máximo 120MB. Tipos: image/jpeg, image/png, image/gif, image/webp, video/mp4.
 *
 * Usa fetch directo (no api.request) porque api.request fuerza
 * Content-Type: application/json, incompatible con multipart/form-data.
 * Auth: Bearer token desde localStorage, igual que api.ts.
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('sf_token');

  // NO enviar Content-Type: el browser lo setea automático con boundary para multipart
  const response = await fetch(`${API_URL}/upload.php`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    throw { status: response.status, message: json.error || json.message || 'Error al subir archivo' };
  }

  if (!json.data?.url) {
    throw { message: 'Respuesta inválida del servidor' };
  }

  return json.data;
}

/**
 * Sube múltiples archivos en paralelo.
 * Retorna un array de UploadResponse en el mismo orden que los archivos.
 */
export async function uploadMultipleFiles(files: File[]): Promise<UploadResponse[]> {
  return Promise.all(files.map(file => uploadFile(file)));
}
