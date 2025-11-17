import type { Review } from '../components/ReviewCard';

export function initializeSampleReviews(): void {
  // Check if reviews already exist
  const existingReviews = localStorage.getItem('reviews');
  if (existingReviews) {
    return; // Don't overwrite existing reviews
  }

  const sampleReviews: Review[] = [
    // Reviews for Tienda Mary (sample1)
    {
      id: 'r1',
      storeId: 'sample1',
      userId: 'user1',
      userName: 'Ana García',
      rating: 5,
      comment: '¡Excelente servicio! La ropa es de muy buena calidad y los precios son justos. Muy recomendado.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
      id: 'r2',
      storeId: 'sample1',
      userId: 'user2',
      userName: 'Carlos Méndez',
      rating: 5,
      comment: 'Siempre encuentro lo que busco. La atención es muy amable.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    },
    {
      id: 'r3',
      storeId: 'sample1',
      userId: 'user3',
      userName: 'María López',
      rating: 4,
      comment: 'Buena variedad de productos. Los zapatos son muy cómodos.',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    },
    {
      id: 'r4',
      storeId: 'sample1',
      userId: 'user4',
      userName: 'José Hernández',
      rating: 5,
      comment: 'Compré zapatos para toda la familia. Excelente calidad!',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    },

    // Reviews for Panadería El Buen Pan (sample2)
    {
      id: 'r5',
      storeId: 'sample2',
      userId: 'user5',
      userName: 'Lucía Ramírez',
      rating: 5,
      comment: '¡El pan más rico de Gualán! Siempre fresco y calentito.',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    },
    {
      id: 'r6',
      storeId: 'sample2',
      userId: 'user6',
      userName: 'Pedro Gómez',
      rating: 4,
      comment: 'Buen pan francés. Los precios son accesibles.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    },
    {
      id: 'r7',
      storeId: 'sample2',
      userId: 'user7',
      userName: 'Sofia Torres',
      rating: 5,
      comment: 'Me encantan las artesanías que venden. Todo hecho con mucho amor.',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    },
    {
      id: 'r8',
      storeId: 'sample2',
      userId: 'user8',
      userName: 'Roberto Flores',
      rating: 4,
      comment: 'Buen servicio. El pan siempre está fresco.',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
    },
  ];

  localStorage.setItem('reviews', JSON.stringify(sampleReviews));
}
