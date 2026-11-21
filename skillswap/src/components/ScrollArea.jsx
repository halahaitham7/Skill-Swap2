import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Horizontal scroller with an intentional cue: the edge fades out only on the
 * side(s) where more content is hidden, so nothing looks accidentally clipped.
 * Keyboard users can focus the region and scroll with the arrow keys.
 */
const ScrollArea = forwardRef(function ScrollArea({ as: Tag = 'div', className = '', label, children, ...rest }, forwardedRef) {
  const innerRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const setRef = (node) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const measure = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 2, right: el.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return undefined;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
    };
  }, [measure, children]);

  const fade = edges.left && edges.right ? 'both' : edges.left ? 'left' : edges.right ? 'right' : 'none';
  const scrollable = edges.left || edges.right;

  return (
    <Tag
      ref={setRef}
      className={`scroll-area ${className}`}
      data-fade={fade}
      tabIndex={scrollable ? 0 : undefined}
      role={label && scrollable ? 'region' : undefined}
      aria-label={label && scrollable ? label : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default ScrollArea;
