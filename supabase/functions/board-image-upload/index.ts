import { ImageMagick, initializeImageMagick } from '@imagemagick/magick-wasm';
import { createSupabaseContext } from '@supabase/server';

const BUCKET = 'groupware-board-attachments';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MIME_BY_FORMAT = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
} as const;
const EXTENSION_BY_FORMAT = { jpeg: 'jpg', png: 'png', webp: 'webp', gif: 'gif' } as const;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const wasmBytes = await Deno.readFile(
  new URL('magick.wasm', import.meta.resolve('npm:@imagemagick/magick-wasm@0.0.41')),
);
await initializeImageMagick(wasmBytes);

type ImageFormat = keyof typeof MIME_BY_FORMAT;

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

function detectFormat(bytes: Uint8Array): ImageFormat | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'webp';
  if (bytes.length >= 6) {
    const signature = String.fromCharCode(...bytes.slice(0, 6));
    if (signature === 'GIF87a' || signature === 'GIF89a') return 'gif';
  }
  return null;
}

function decodeImage(bytes: Uint8Array) {
  try {
    return ImageMagick.read(bytes, (image) => ({ width: image.width, height: image.height }));
  } catch {
    throw new Error('이미지를 해석할 수 없습니다. 손상되지 않은 이미지인지 확인해 주세요.');
  }
}

export default {
  async fetch(request: Request) {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
    if (request.method !== 'POST') return response({ error: 'method_not_allowed' }, 405);

    const { data: context, error: contextError } = await createSupabaseContext(request, { auth: 'user' });
    if (contextError || !context) return response({ error: 'authentication_required' }, contextError?.status ?? 401);

    try {
      const form = await request.formData();
      const file = form.get('file');
      const boardId = String(form.get('board_id') ?? '');
      const postId = String(form.get('post_id') ?? '');
      const originalName = String(form.get('original_name') ?? (file instanceof File ? file.name : 'image'));
      const replacesAttachmentId = String(form.get('replaces_attachment_id') ?? '') || null;
      const userId = String(context.userClaims?.id ?? context.jwtClaims?.sub ?? '');

      if (!(file instanceof File) || !boardId || !postId || !userId) return response({ error: 'invalid_upload_request' }, 400);
      if (file.size < 1 || file.size > MAX_IMAGE_BYTES) return response({ error: 'inline_image_size_exceeded' }, 413);
      if (!ALLOWED_MIME_TYPES.has(file.type)) return response({ error: 'image_type_not_allowed' }, 415);
      if (!/\.(jpe?g|png|webp|gif)$/i.test(originalName)) return response({ error: 'image_extension_not_allowed' }, 415);

      const bytes = new Uint8Array(await file.arrayBuffer());
      const format = detectFormat(bytes);
      if (!format || MIME_BY_FORMAT[format] !== file.type) return response({ error: 'image_signature_mismatch' }, 415);

      const { width, height } = decodeImage(bytes);
      if (!width || !height || width * height > MAX_PIXELS) return response({ error: 'invalid_image_dimensions' }, 422);

      const storagePath = `${boardId}/${userId}/inline/${postId}/${crypto.randomUUID()}.${EXTENSION_BY_FORMAT[format]}`;
      const { error: uploadError } = await context.supabase.storage.from(BUCKET).upload(storagePath, file, {
        contentType: MIME_BY_FORMAT[format],
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: attachment, error: registerError } = await context.supabaseAdmin.rpc('register_inline_board_image', {
        p_board_id: boardId,
        p_post_id: postId,
        p_storage_path: storagePath,
        p_original_name: originalName,
        p_mime_type: MIME_BY_FORMAT[format],
        p_file_size: file.size,
        p_image_width: width,
        p_image_height: height,
        p_image_format: format,
        p_uploader_id: userId,
        p_replaces_attachment_id: replacesAttachmentId,
      });
      if (registerError) {
        await context.supabase.storage.from(BUCKET).remove([storagePath]);
        throw registerError;
      }

      return response({ attachment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'image_upload_failed';
      return response({ error: message }, 400);
    }
  },
};
