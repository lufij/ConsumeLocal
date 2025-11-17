import type { Review } from '../components/ReviewCard';

export function getStoreReviews(storeId: string): Review[] {
  const reviewsStr = localStorage.getItem('reviews');
  if (!reviewsStr) return [];
  
  const allReviews: Review[] = JSON.parse(reviewsStr);
  return allReviews.filter(r => r.storeId === storeId);
}

export function getStoreRating(storeId: string): { rating: number; totalReviews: number } {
  const reviews = getStoreReviews(storeId);
  
  if (reviews.length === 0) {
    return { rating: 0, totalReviews: 0 };
  }
  
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / reviews.length;
  
  return {
    rating: avgRating,
    totalReviews: reviews.length,
  };
}

export function hasUserReviewedStore(userId: string, storeId: string): boolean {
  const reviews = getStoreReviews(storeId);
  return reviews.some(r => r.userId === userId);
}

export function getUserReviewForStore(userId: string, storeId: string): Review | null {
  const reviews = getStoreReviews(storeId);
  return reviews.find(r => r.userId === userId) || null;
}

export function saveReview(review: Review): void {
  const reviewsStr = localStorage.getItem('reviews');
  let allReviews: Review[] = [];
  
  if (reviewsStr) {
    allReviews = JSON.parse(reviewsStr);
  }
  
  allReviews.push(review);
  localStorage.setItem('reviews', JSON.stringify(allReviews));
}

export function deleteReview(reviewId: string): void {
  const reviewsStr = localStorage.getItem('reviews');
  if (!reviewsStr) return;
  
  const allReviews: Review[] = JSON.parse(reviewsStr);
  const filteredReviews = allReviews.filter(r => r.id !== reviewId);
  localStorage.setItem('reviews', JSON.stringify(filteredReviews));
}

export function updateReview(reviewId: string, updates: Partial<Review>): void {
  const reviewsStr = localStorage.getItem('reviews');
  if (!reviewsStr) return;
  
  const allReviews: Review[] = JSON.parse(reviewsStr);
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1) {
    allReviews[reviewIndex] = { ...allReviews[reviewIndex], ...updates };
    localStorage.setItem('reviews', JSON.stringify(allReviews));
  }
}
