import type {
  Category,
  CreateRestaurantRequest,
  CreateReviewRequest,
  CreateUserRequest,
  Restaurant,
  Review,
  UpdateRestaurantRequest,
  User,
  UserProfileResponse,
} from '../../../domain/models';
import { DEV_MOCK_AUTH_DISPLAY_NAME, DEV_MOCK_AUTH_EMAIL } from '../dev-mock-firebase-user';

let userSeq = 1;
let restaurantSeq = 1;
let reviewSeq = 1;

const usersById = new Map<string, User>();
const usersByEmail = new Map<string, User>();

const restaurantsById = new Map<string, Restaurant>();
const reviewsById = new Map<string, Review>();

export function resetDevMockApiState(): void {
  userSeq = 1;
  restaurantSeq = 1;
  reviewSeq = 1;
  usersById.clear();
  usersByEmail.clear();
  restaurantsById.clear();
  reviewsById.clear();
}

/** Ensures the mock API has a user matching mock-auth email so `userExistsGuard` passes. Idempotent. */
export function ensureDevMockUserFromAuth(): void {
  if (devMockFindUserByEmail(DEV_MOCK_AUTH_EMAIL)) return;
  devMockCreateUser({
    name: DEV_MOCK_AUTH_DISPLAY_NAME,
    email: DEV_MOCK_AUTH_EMAIL,
    address: {
      city: 'Dev City',
      state: 'DC',
      country: 'Devland',
    },
  });
}

export function devMockListUsers(): User[] {
  return [...usersById.values()];
}

export function devMockFindUserByEmail(email: string): User | undefined {
  return usersByEmail.get(email.toLowerCase());
}

export function devMockFindUserById(id: string): User | undefined {
  return usersById.get(id);
}

export function devMockGetUserProfile(userId: string): UserProfileResponse | null {
  const user = devMockFindUserById(userId);
  if (!user) return null;
  const reviews = [...reviewsById.values()].filter((r) => r.user.id === userId);
  return {
    user,
    reviews,
    visitedRestaurants: dedupeVisitedRestaurants(reviews),
  };
}

function dedupeVisitedRestaurants(reviews: Review[]): Restaurant[] {
  const seen = new Set<string>();
  const out: Restaurant[] = [];
  for (const r of reviews) {
    if (!seen.has(r.restaurant.id)) {
      seen.add(r.restaurant.id);
      out.push(r.restaurant);
    }
  }
  return out;
}

export function devMockPatchUserImage(userId: string, image?: string): User | undefined {
  const u = usersById.get(userId);
  if (!u) return undefined;
  if (image === undefined) {
    return u;
  }
  const next: User = { ...u };
  if (image === '') {
    delete next.image;
  } else {
    next.image = image;
  }
  usersById.set(userId, next);
  usersByEmail.set(next.email.toLowerCase(), next);
  return next;
}

export function devMockCreateUser(body: CreateUserRequest): User {
  const id = `mock-user-${userSeq++}`;
  const user: User = {
    id,
    name: body.name,
    email: body.email,
    address: { ...body.address },
    ...(body.image?.trim() ? { image: body.image.trim() } : {}),
  };
  usersById.set(id, user);
  usersByEmail.set(body.email.toLowerCase(), user);
  return user;
}

export function devMockListRestaurants(): Restaurant[] {
  return [...restaurantsById.values()];
}

export type DevMockRestaurantSearchPage = {
  items: Restaurant[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

function devMockRestaurantMatchesQuery(r: Restaurant, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const haystack = [
    r.name,
    r.address.city,
    r.address.state,
    r.address.country,
    r.about ?? '',
    ...r.categories.map((c) => c.name),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(t);
}

export function devMockSearchRestaurantsPaged(
  q: string,
  page: number,
  limit: number,
): DevMockRestaurantSearchPage {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit) || 10));
  const all = devMockListRestaurants()
    .filter((r) => devMockRestaurantMatchesQuery(r, q))
    .sort((a, b) => a.name.localeCompare(b.name));
  const total = all.length;
  const offset = (safePage - 1) * safeLimit;
  const items = all.slice(offset, offset + safeLimit);
  const hasMore = offset + items.length < total;
  return { items, total, page: safePage, limit: safeLimit, hasMore };
}

export function devMockRestaurantCategories(): Category[] {
  const names = new Set<string>();
  for (const r of restaurantsById.values()) {
    for (const c of r.categories) {
      names.add(c.name);
    }
  }
  if (!names.size) {
    return [{ name: 'Italian' }, { name: 'Pizza' }];
  }
  return [...names].sort().map((name) => ({ name }));
}

export function devMockRestaurantsByCategory(categoryName: string): Restaurant[] {
  return [...restaurantsById.values()].filter((r) =>
    r.categories.some((c) => c.name.toLowerCase() === categoryName.toLowerCase()),
  );
}

export function devMockFindRestaurantById(id: string): Restaurant | undefined {
  return restaurantsById.get(id);
}

export type DevMockRestaurantCreateBody = CreateRestaurantRequest & { id?: string };

export function devMockCreateRestaurant(body: DevMockRestaurantCreateBody): Restaurant {
  const rawId = typeof body.id === 'string' ? body.id.trim() : '';
  const id = rawId.length > 0 ? rawId : `mock-restaurant-${restaurantSeq++}`;
  const { id: _drop, ...rest } = body;
  const restaurant: Restaurant = {
    id,
    name: rest.name,
    address: { ...rest.address },
    categories: rest.categories.map((c) => ({ name: c.name })),
    instagram: rest.instagram,
    images: rest.images ? [...rest.images] : undefined,
    ...(rest.about?.trim() ? { about: rest.about.trim() } : {}),
  };
  restaurantsById.set(id, restaurant);
  return restaurant;
}

export function devMockUpdateRestaurant(
  id: string,
  body: UpdateRestaurantRequest,
): Restaurant | undefined {
  const cur = restaurantsById.get(id);
  if (!cur) return undefined;
  const next: Restaurant = { ...cur };
  if (body.name !== undefined) next.name = body.name;
  if (body.address !== undefined) {
    next.address = { ...next.address, ...body.address };
  }
  if (body.categories !== undefined) {
    next.categories = body.categories.map((c) => ({ name: c.name }));
  }
  if (body.instagram !== undefined) {
    next.instagram = body.instagram;
  }
  if (body.images !== undefined) {
    next.images = body.images.length ? [...body.images] : undefined;
  }
  if (body.about !== undefined) {
    const t = body.about.trim();
    if (!t) {
      delete (next as { about?: string }).about;
    } else {
      next.about = body.about;
    }
  }
  restaurantsById.set(id, next);
  return next;
}

export function devMockBulkCreateRestaurants(items: DevMockRestaurantCreateBody[]): Restaurant[] {
  return items.map((item) => devMockCreateRestaurant(item));
}

export function devMockListReviews(): Review[] {
  return [...reviewsById.values()];
}

export function devMockFindReviewById(id: string): Review | undefined {
  return reviewsById.get(id);
}

export function devMockCreateReview(body: CreateReviewRequest): Review {
  const user = devMockFindUserById(body.userId);
  if (!user) {
    throw new Error(`devMockCreateReview: user not found: ${body.userId}`);
  }
  const restaurant = devMockFindRestaurantById(body.restaurantId);
  if (!restaurant) {
    throw new Error(`devMockCreateReview: restaurant not found: ${body.restaurantId}`);
  }
  const id = `mock-review-${reviewSeq++}`;
  const review: Review = {
    id,
    user,
    restaurant,
    note: { ...body.note },
    commentary: body.commentary,
    images: [...body.images],
  };
  reviewsById.set(id, review);
  return review;
}
