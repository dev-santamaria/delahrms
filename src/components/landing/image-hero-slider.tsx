"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Users, Clock, Receipt, FileCheck2, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageHeroSliderProps {
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
}

export function ImageHeroSlider({ currentSlide = 0, onSlideChange }: ImageHeroSliderProps) {
  const [current, setCurrent] = useState(currentSlide);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      src: "/images/img (1).jpg",
      title: "Global Workforce & People Empowerment",
      subtitle: "Unify domestic and international employees under one clear organization hierarchy",
      tag: "Multi-Entity Core HR",
      icon: Users,
    },
    {
      src: "/images/img (2).jpg",
      title: "24/7 Continuous Shift Rosters & Mining Logistics",
      subtitle: "Intelligent fatigue limits, 12-hour mandatory rest, and automatic hazard allowances",
      tag: "Shift Intelligence",
      icon: Clock,
    },
    {
      src: "/images/img (3).jpg",
      title: "Frictionless Travel Advances & Instant Reimbursements",
      subtitle: "Pre-trip cash advances disbursed directly to mobile money or bank accounts",
      tag: "Field & Travel Operations",
      icon: Receipt,
    },
    {
      src: "/images/img (4).jpg",
      title: "Paperless Digital Workflows & Secure E-Signatures",
      subtitle: "Eliminate paper forms and manual scans with verified cryptographic audit trails",
      tag: "Digital Compliance",
      icon: FileCheck2,
    },
  ];

  // Keep internal state in sync if parent changes currentSlide externally
  useEffect(() => {
    if (currentSlide !== undefined && currentSlide !== current) {
      setCurrent(currentSlide);
    }
  }, [currentSlide, current]);

  const goToSlide = useCallback(
    (index: number) => {
      const nextIndex = (index + slides.length) % slides.length;
      setCurrent(nextIndex);
      onSlideChange?.(nextIndex);
    },
    [slides.length, onSlideChange]
  );

  const nextSlide = useCallback(() => {
    goToSlide(current + 1);
  }, [goToSlide, current]);

  const prevSlide = useCallback(() => {
    goToSlide(current - 1);
  }, [goToSlide, current]);

  // Autoplay timer: auto moves smoothly to next slide every 5.5s unless hovered
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      goToSlide(current + 1);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, current, goToSlide]);

  return (
    <div
      className="relative w-full mx-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Card Frame */}
      <div className="relative h-72 sm:h-80 md:h-96 lg:h-[440px] w-full rounded-2xl overflow-hidden border border-[var(--gray-border)] shadow-md bg-[var(--cool-gray)]">
        {slides.map((slide, index) => {
          const IconComponent = slide.icon;
          const isActive = current === index;

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image with Ultra-Smooth Cinematic Slow Zoom */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className={`object-cover transform transition-transform duration-7000 ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
              </div>

              {/* Seamless Dark Vignette Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

              {/* Top Tag Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[var(--emerald-deep)] text-xs font-bold shadow-xs">
                  <IconComponent className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                  <span>{slide.tag}</span>
                </span>
              </div>

              {/* Bottom Text Content with Subtle Fade-In */}
              <div
                className={`absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 space-y-1.5 text-white transition-all duration-700 delay-150 ${
                  isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight drop-shadow-sm">
                  {slide.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-2xl leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          );
        })}

        {/* Previous Navigation Arrow */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-white/90 hover:bg-white text-[var(--gray-text)] shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Next Navigation Arrow */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-white/90 hover:bg-white text-[var(--gray-text)] shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Slide Indicators: Clean Pill Bars */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            suppressHydrationWarning
            onClick={() => goToSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              current === idx
                ? "w-7 bg-[var(--emerald-deep)]"
                : "w-2 bg-[var(--gray-border)] hover:bg-[var(--gray-muted)]"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
