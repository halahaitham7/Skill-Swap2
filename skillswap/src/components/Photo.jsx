import { PHOTOS, photoUrl } from '../data/photos.js';

const WIDTHS = [480, 800, 1200, 1600];

/**
 * Responsive photo with a fixed aspect ratio. `object-fit: cover` keeps the
 * image from stretching, and width/height attributes reserve space so the
 * layout doesn't jump while it loads.
 */
export default function Photo({ name, ratio = '3 / 2', sizes = '(max-width: 1023px) 100vw, 45vw', priority = false, className = '', credit = true }) {
  const p = PHOTOS[name];
  if (!p) return null;
  return (
    <figure className={`photo ${className}`} style={{ '--ratio': ratio }}>
      <img
        src={photoUrl(p.id, 1200)}
        srcSet={WIDTHS.map((w) => `${photoUrl(p.id, w)} ${w}w`).join(', ')}
        sizes={sizes}
        width={p.width}
        height={p.height}
        alt={p.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
      />
      {credit && (
        <figcaption className="photo-credit">
          Photo:{' '}
          <a href={p.page} target="_blank" rel="noopener noreferrer">
            {p.credit} on Unsplash
          </a>
        </figcaption>
      )}
    </figure>
  );
}
