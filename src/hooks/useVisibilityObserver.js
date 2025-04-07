import { useEffect, useRef, useState } from "react";

/**
 * Hook para observar se um elemento está visível na tela usando IntersectionObserver.
 * 
 * @param {IntersectionObserverInit} options - Opções para o IntersectionObserver.
 * @returns {[React.RefObject, boolean]} - Retorna a ref do elemento e um booleano indicando visibilidade.
 */
export function useVisibilityObserver(options = { threshold: 0.3 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentElement = ref.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options]);

  return [ref, isVisible];
}
