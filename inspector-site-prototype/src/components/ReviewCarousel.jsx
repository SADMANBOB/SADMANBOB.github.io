import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { getApprovedReviews } from "../../../shared/reviewRegistry.js";

const AUTO_ADVANCE_MS = 8_000;

function ReviewCard({ review, active, label }) {
  if (!review) return <div className="review-card review-card-side" aria-hidden="true" />;

  return (
    <article
      className={`review-card ${active ? "review-card-active" : "review-card-side"}`}
      aria-hidden={active ? undefined : "true"}
      aria-label={active ? label : undefined}
      role={active ? "group" : undefined}
      aria-roledescription={active ? "slide" : undefined}
    >
      <div className="review-card-meta">
        <span className="review-slot-label">Published with permission</span>
        <span className="review-theme">Source verified</span>
      </div>
      <p className="review-copy">{review.exactApprovedText}</p>
      <footer className="review-attribution">
        <span>{review.displayAttribution}</span>
        {active ? <a href={review.sourceUrl} target="_blank" rel="noreferrer">View approved source</a> : null}
      </footer>
    </article>
  );
}

export function ReviewCarousel({
  surface = "inspector-home",
  heading = "What clients chose to share.",
  intro = "Each published review uses only source-backed text and attribution approved for this page.",
}) {
  const headingId = useId();
  const trackId = useId();
  const playbackTouchedRef = useRef(false);
  const reviews = useMemo(() => getApprovedReviews(surface), [surface]);
  const reviewCount = reviews.length;
  const canRotate = reviewCount > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(true);

  useEffect(() => {
    setCurrentIndex((index) => reviewCount ? index % reviewCount : 0);
  }, [reviewCount]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      if (canRotate && !playbackTouchedRef.current) setIsPlaying(true);
      return undefined;
    }

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlaybackPreference = () => {
      if (motionPreference.matches) setIsPlaying(false);
      else if (canRotate && !playbackTouchedRef.current) setIsPlaying(true);
    };
    syncPlaybackPreference();
    motionPreference.addEventListener("change", syncPlaybackPreference);
    return () => motionPreference.removeEventListener("change", syncPlaybackPreference);
  }, [canRotate]);

  useEffect(() => {
    const syncVisibility = () => setDocumentHidden(document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const shouldAdvance = canRotate
    && isPlaying
    && !isHovered
    && !hasFocusWithin
    && !documentHidden;

  useEffect(() => {
    if (!shouldAdvance) return undefined;
    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % reviewCount);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [reviewCount, shouldAdvance]);

  if (!reviewCount) return null;

  const showPrevious = reviewCount > 2;
  const previousReview = showPrevious
    ? reviews[(currentIndex - 1 + reviewCount) % reviewCount]
    : null;
  const currentReview = reviews[currentIndex];
  const nextReview = reviewCount > 1
    ? reviews[(currentIndex + 1) % reviewCount]
    : null;

  const move = (direction) => {
    setCurrentIndex((index) => (index + direction + reviewCount) % reviewCount);
  };

  const togglePlayback = () => {
    playbackTouchedRef.current = true;
    setIsPlaying((playing) => !playing);
  };

  return (
    <section
      className="review-section"
      aria-labelledby={headingId}
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocusWithin(false);
      }}
    >
      <div className="container">
        <header className="review-header">
          <div><p className="eyebrow">{reviewCount} approved review{reviewCount === 1 ? "" : "s"}</p><h2 id={headingId}>{heading}</h2></div>
          <p className="review-intro">{intro}</p>
        </header>
        <div
          id={trackId}
          className="review-wheel"
          aria-live={shouldAdvance ? "off" : "polite"}
          aria-atomic="true"
        >
          <ReviewCard review={previousReview} active={false} />
          <ReviewCard review={currentReview} active label={`Review ${currentIndex + 1} of ${reviewCount}`} />
          <ReviewCard review={nextReview} active={false} />
        </div>
        {canRotate ? (
          <div className="review-controls">
            <button className="review-nav-button" type="button" aria-controls={trackId} aria-label="Show previous review" onClick={() => move(-1)}><ChevronLeft aria-hidden="true" /></button>
            <span className="review-counter" aria-label={`Review ${currentIndex + 1} of ${reviewCount}`}><strong aria-hidden="true">{String(currentIndex + 1).padStart(2, "0")}</strong><span aria-hidden="true">/ {String(reviewCount).padStart(2, "0")}</span></span>
            <button className="review-nav-button" type="button" aria-controls={trackId} aria-label="Show next review" onClick={() => move(1)}><ChevronRight aria-hidden="true" /></button>
            <button className="review-nav-button" type="button" aria-controls={trackId} aria-label={isPlaying ? "Pause automatic review rotation" : "Play automatic review rotation"} onClick={togglePlayback}>{isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
