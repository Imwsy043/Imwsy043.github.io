import { useEffect, useRef } from "react";

import "../../styles/cat-companion.stylus";

export default function CatCompanion({ imageUrl }: { imageUrl: string }) {
  const companionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = companionRef.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let currentX = window.innerWidth - 130;
    let currentY = window.innerHeight - 150;
    let targetX = currentX;
    let targetY = currentY;
    let frame = 0;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const render = () => {
      const easing = reducedMotion ? 1 : 0.16;
      currentX += (targetX - currentX) * easing;
      currentY += (targetY - currentY) * easing;
      element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const size = element.offsetWidth || 46;
      const gap = 20;
      const placeLeft = event.clientX + gap + size > window.innerWidth;
      const nextX = placeLeft
        ? event.clientX - size - gap
        : event.clientX + gap;

      targetX = clamp(nextX, 10, window.innerWidth - size - 10);
      targetY = clamp(
        event.clientY + gap,
        72,
        window.innerHeight - size - 10
      );
      element.classList.add("is-visible");
    };

    const handlePointerLeave = () => element.classList.remove("is-visible");

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);
    frame = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handlePointerLeave
      );
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={companionRef} className="cat-companion" aria-hidden="true">
      <img src={imageUrl} alt="" />
    </div>
  );
}
