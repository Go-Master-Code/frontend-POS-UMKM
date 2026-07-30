import api from "./index"

/*
|--------------------------------------------------------------------------
| Upload Service
|--------------------------------------------------------------------------
| Request untuk upload file (logo dll)
|--------------------------------------------------------------------------
*/

/**
 * POST /upload/logo
 * Upload file logo ke backend menggunakan multipart/form-data
 */

export function uploadLogo(formData) {
    return api.post("upload/logo",formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

/**
 * DELETE /upload/logo
 * Delete file logo setelah selesai proses upload logo selesai
 */

export function deleteLogo(fileName) {
    return api.delete(`upload/logo/${encodeURIComponent(fileName)}`);
    // encodeURIComponent dipakai untuk jaga-jaga jika suatu saat nama file mengandung spasi atau karakter khusus.
}