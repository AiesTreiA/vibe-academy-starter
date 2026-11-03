// Shared configuration for Vibecode Lab bootcamp dates and pricing thresholds.
// Modify these dates here to automatically update across the backend routes,
// status APIs, chatbot prompts, email services, and the landing page UI.

export const VIBECODE_CONFIG = {
  // Capacidad máxima de alumnos por cohorte
  maxSeats: 11,

  // Start and end ranges for the progress bar timeline
  timelineStart: "2026-10-01T00:00:00-04:00",
  timelineEnd: "2026-11-25T20:00:00-04:00",

  // Pricing phase deadlines (Chile timezone)
  d1: "2026-11-08T23:59:59-04:00", // End of Phase 1 (30% Off -> $209 USD)
  d2: "2026-11-15T23:59:59-04:00", // End of Phase 2 (20% Off -> $237 USD)
  d3: "2026-11-22T23:59:59-04:00", // End of Phase 3 (10% Off -> $265 USD)

  // Official launch date and time (Chile timezone)
  launchDate: "2026-11-25T20:00:00-04:00",

  // Human readable labels for UI rendering (e.g. Timeline component)
  labels: {
    start: "1 Oct",
    t1: "8 Nov",
    t2: "15 Nov",
    t3: "22 Nov",
    launch: "25 Nov"
  }
};

export function getVibecodeTierInfo(currentDate: Date = new Date()) {
  const d1 = new Date(VIBECODE_CONFIG.d1)
  const d2 = new Date(VIBECODE_CONFIG.d2)
  const d3 = new Date(VIBECODE_CONFIG.d3)

  if (currentDate <= d1) {
    return {
      tierNumber: 1,
      tierName: "Tramo 1 de Preventa (30% OFF de lista)",
      discountLabel: "30% OFF activo",
      deadlineLabel: "Domingo 8 de Noviembre a las 23:59 hrs",
      extraCouponDiscount: "20% OFF Extra",
      couponCode: "ARTICULO20",
      couponNotice: "Aprovecha la preventa anticipada del Tramo 1 para la Generación 2 hasta el 8 de Noviembre.",
      nextDeadlineLabel: "15 de Noviembre",
      priceUSD: 209
    }
  } else if (currentDate <= d2) {
    return {
      tierNumber: 2,
      tierName: "Tramo 2 de Preventa (20% OFF de lista)",
      discountLabel: "20% OFF activo",
      deadlineLabel: "Domingo 15 de Noviembre a las 23:59 hrs",
      extraCouponDiscount: "15% OFF Extra",
      couponCode: "ARTICULO15",
      couponNotice: "Tramo 2 de preventa activo para la Generación 2. Aplica cupón antes del 15 de Noviembre.",
      nextDeadlineLabel: "22 de Noviembre",
      priceUSD: 237
    }
  } else if (currentDate <= d3) {
    return {
      tierNumber: 3,
      tierName: "Tramo 3 (Último Tramo de Preventa - 10% OFF de lista)",
      discountLabel: "10% OFF activo",
      deadlineLabel: "Domingo 22 de Noviembre a las 23:59 hrs",
      extraCouponDiscount: "10% OFF Extra",
      couponCode: "ARTICULO10",
      couponNotice: "¡Último tramo de preventa activo antes del inicio de clases! Descuento válido hasta el 22 de Noviembre.",
      nextDeadlineLabel: "25 de Noviembre (Inicio de Clases)",
      priceUSD: 265
    }
  } else {
    return {
      tierNumber: 4,
      tierName: "Preventa Final (Previo a Inicio de Clases)",
      discountLabel: "Precio de Lista",
      deadlineLabel: "Miércoles 25 de Noviembre a las 19:00 hrs",
      extraCouponDiscount: "5% OFF Extra",
      couponCode: "ARTICULO5",
      couponNotice: "Últimos cupos disponibles antes de iniciar las clases de la Generación 2 el 25 de Noviembre.",
      nextDeadlineLabel: "25 de Noviembre",
      priceUSD: 297
    }
  }
}
