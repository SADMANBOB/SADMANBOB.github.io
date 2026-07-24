import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import {
  getRenderableReviews,
  legacyReviewAggregate,
} from "../../../shared/reviewRegistry.js";

const AUTO_ADVANCE_MS = 10_000;

function StarRating({ rating }) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return (
    <div className="review-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          aria-hidden="true"
          className={index < rating ? "is-filled" : "is-empty"}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ review, active, label, mode }) {
  if (!review || !active) return <div className="review-card review-card-side" aria-hidden="true" />;

  return (
    <article
      className="review-card review-card-active"
      aria-label={label}
      role="group"
      aria-roledescription="slide"
    >
      <div className="review-card-meta">
        <span className="review-slot-label">
          {mode === "approved" ? "Published with permission" : "Legacy feedback pending owner confirmation"}
        </span>
        <StarRating rating={review.rating} />
      </div>
      <p className="review-copy">{review.text}</p>
      <footer className="review-attribution">
        <span>{review.attribution}</span>
        {review.sourceUrl ? (
          <a href={review.sourceUrl} target="_blank" rel="noreferrer">View approved source</a>
        ) : null}
      </footer>
    </article>
  );
}

export function ReviewCarousel({
  surface = "inspector-home",
  heading = "Client feedback",
  intro,
  emptyCopy = "Approved client reviews will appear here after owner confirmation. Until then, the report focuses on clear findings, photographs, and practical next steps.",
}) {
  const headingId = useId();
  const trackId = useId();
  const playbackTouchedRef = useRef(false);
  const renderable = useMemo(() => getRenderableReviews(surface), [surface]);
  const reviews = renderable.reviews;
  const reviewCount = reviews.length;
  const aggregate = useMemo(
    () => (renderable.mode === "legacy_pending_owner_confirmation" ? legacyReviewAggregate(reviews) : null),
    [renderable.mode, reviews],
  );
  const canRotate = reviewCount > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(true);

  useEffect(() => {
    setCurrentIndex((index) => (reviewCount ? index % reviewCount : 0));
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

  const resolvedIntro = intro || renderable.intro || emptyCopy;

  if (!reviewCount) {
    return (
      <section className="trust-expectation-band" aria-labelledby={headingId}>
        <div className="container">
          <header className="review-header">
            <div>
              <p className="eyebrow">What the report is designed to provide</p>
              <h2 id={headingId}>{heading}</h2>
            </div>
            <p className="review-intro">{resolvedIntro}</p>
          </header>
        </div>
      </section>
    );
  }

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
      data-feedback-mode={renderable.mode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocusWithin(false);
      }}
    >
      <div className="container">
        <header className="review-header">
          <div>
            <p className="eyebrow">
              {renderable.mode === "approved"
                ? `${reviewCount} approved review${reviewCount === 1 ? "" : "s"}`
                : "Feedback from past clients"}
            </p>
            <h2 id={headingId}>{heading}</h2>
            {aggregate ? (
              <p className="review-aggregate">
                <strong>{aggregate.average.toFixed(1)} / 5</strong>
                {" "}
                ·
                {" "}
                {aggregate.label}
              </p>
            ) : null}
          </div>
          <p className="review-intro">{resolvedIntro}</p>
        </header>
        <div
          id={trackId}
          className="review-wheel"
          aria-live={shouldAdvance ? "off" : "polite"}
          aria-atomic="true"
        >
          <FeedbackCard review={previousReview} active={false} mode={renderable.mode} />
          <FeedbackCard
            review={currentReview}
            active
            mode={renderable.mode}
            label={`Feedback ${currentIndex + 1} of ${reviewCount}`}
          />
          <FeedbackCard review={nextReview} active={false} mode={renderable.mode} />
        </div>
        {canRotate ? (
          <div className="review-controls">
            <button className="review-nav-button" type="button" aria-controls={trackId} onClick={() => move(-1)}>
              <ChevronLeft aria-hidden="true" />
              <span>Previous</span>
            </button>
            <span className="review-counter" role="status">
              <strong>{String(currentIndex + 1).padStart(2, "0")}</strong>
              <span>/ {String(reviewCount).padStart(2, "0")}</span>
            </span>
            <button className="review-nav-button" type="button" aria-controls={trackId} onClick={() => move(1)}>
              <span>Next</span>
              <ChevronRight aria-hidden="true" />
            </button>
            <button
              className="review-nav-button"
              type="button"
              aria-controls={trackId}
              aria-label={isPlaying ? "Pause automatic feedback rotation" : "Play automatic feedback rotation"}
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
