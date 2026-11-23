/**
 * Cloudinary adresine boyut dönüşümü ekler; liste ve detayda tam boy yerine
 * küçük, otomatik formatlı bir kopya indirilir.
 */
export function photoThumbnail(url: string, width: number, height = width) {
  return url.replace('/image/upload/', `/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
}
