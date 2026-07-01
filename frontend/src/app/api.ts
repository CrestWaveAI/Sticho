export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export interface LocationInfo {
  id: string;
  name: string;
  city: string;
  pin_code: string;
}

export interface ServiceDetail {
  id: string;
  price_estimate: string;
  time_estimate_days: number;
  description: string;
  category: {
    id: string;
    name: string;
    description: string;
  };
}

export interface PortfolioImage {
  id: string;
  tailor_id: string;
  image_url: string;
  caption: string | null;
  position: number;
  created_at: string;
}

export interface WorkingHourDay {
  open: string | null;
  close: string | null;
  closed: boolean;
}

export interface Tailor {
  id: string;
  name: string;
  email?: string;
  bio: string | null;
  address: string;
  gradient: string;
  rating: number;
  reviews_count: number;
  location: LocationInfo;
  categories: string[];
  services?: ServiceDetail[];
  portfolio_images?: PortfolioImage[];
  contact_number?: string; // Gated, only unlocked after lead submission
  latitude?: number | null;
  longitude?: number | null;
  whatsapp_number?: string;
  experience?: number;
  working_hours?: Record<string, WorkingHourDay | string> | null;
  notifications_enabled?: boolean;
  notification_channel?: string;
}

export interface LeadPayload {
  tailor_id: string;
  customer_name: string;
  customer_mobile: string;
  requirement_description: string;
}

export async function fetchTailors(params: {
  locality?: string;
  city?: string;
  pin_code?: string;
  category?: string;
}): Promise<Tailor[]> {
  const query = new URLSearchParams();
  if (params.locality) query.append("locality", params.locality);
  if (params.city) query.append("city", params.city);
  if (params.pin_code) query.append("pin_code", params.pin_code);
  if (params.category) query.append("category", params.category);

  const res = await fetch(`${API_BASE_URL}/api/v1/tailors?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch tailors");
  return res.json();
}

export async function fetchTailorDetail(id: string): Promise<Tailor> {
  const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${id}`);
  if (!res.ok) throw new Error("Failed to fetch tailor details");
  return res.json();
}

export async function autocompleteLocations(query: string): Promise<LocationInfo[]> {
  if (query.trim().length < 2) return [];
  const res = await fetch(`${API_BASE_URL}/api/v1/locations/autocomplete?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to fetch location suggestions");
  return res.json();
}

export async function submitLead(payload: LeadPayload): Promise<Tailor> {
  const res = await fetch(`${API_BASE_URL}/api/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit lead registration");
  return res.json(); // Returns unlocked tailor detail with contact_number
}

export async function sendOtp(phoneNumber: string): Promise<{ message: string; phone_number: string; otp: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to send OTP");
  }
  return res.json();
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid OTP code");
  }
  return res.json();
}

export async function createTailor(payload: {
  name: string;
  email?: string;
  bio?: string;
  address: string;
  gradient?: string;
  contact_number: string;
  location_id?: string | null;
}): Promise<Tailor> {
  const res = await fetch(`${API_BASE_URL}/api/v1/tailors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create tailor profile");
  }
  return res.json();
}

export async function updateTailor(id: string, payload: {
  name?: string;
  email?: string;
  bio?: string;
  address?: string;
  gradient?: string;
  contact_number?: string;
  location_id?: string | null;
  experience?: number;
  latitude?: number | null;
  longitude?: number | null;
  is_verified?: boolean;
  working_hours?: Record<string, WorkingHourDay | string> | null;
  notifications_enabled?: boolean;
  notification_channel?: string;
}): Promise<Tailor> {
  const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update tailor profile");
  }
  return res.json();
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/categories`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch categories");
  }
  return res.json();
}

export async function createService(payload: {
  tailor_id: string;
  category_id: string;
  price_estimate?: number;
  time_estimate_days?: number;
  description?: string;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/v1/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create service");
  }
  return res.json();
}

export async function deleteService(serviceId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/v1/services/${serviceId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete service");
  }
  return res.json();
}

export async function uploadPortfolioImage(
  tailorId: string,
  file: File,
  caption?: string
): Promise<PortfolioImage> {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) {
    formData.append("caption", caption);
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${tailorId}/portfolio/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload portfolio image");
  }
  return res.json();
}

export async function deletePortfolioImage(
  tailorId: string,
  imageId: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${tailorId}/portfolio/${imageId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete portfolio image");
  }
  return res.json();
}

export async function reorderPortfolioImages(
  tailorId: string,
  positions: { id: string; position: number }[]
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${tailorId}/portfolio/reorder`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(positions),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to save portfolio positions");
  }
  return res.json();
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  tailor_id?: string;
  customer_id?: string;
}

export interface Review {
  id: string;
  tailor_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  customer_name: string;
}

export interface DashboardLead {
  id: string;
  tailor_id: string;
  customer_name: string;
  customer_mobile: string;
  requirement_description: string;
  created_at: string;
}

export interface TailorDashboardData {
  approval_status: string;
  lead_count: number;
  whatsapp_clicks: number;
  call_clicks: number;
  completeness_percentage: number;
  missing_fields: string[];
  recent_leads: DashboardLead[];
}

export async function loginTailor(payload: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password");
  }
  return res.json();
}

export async function registerTailorActual(payload: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to register tailor account");
  }
  return res.json();
}

export async function registerCustomer(payload: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/customer-auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function loginCustomer(payload: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/customer-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password");
  }
  return res.json();
}

export async function googleAuthCustomer(payload: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/customer-auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Google authentication failed");
  }
  return res.json();
}

export async function fetchReviews(tailorId: string): Promise<Review[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/reviews/tailor/${tailorId}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function submitReview(
  payload: { tailor_id: string; rating: number; comment: string },
  customerToken: string
): Promise<Review> {
  const res = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${customerToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit review");
  }
  return res.json();
}

export async function fetchTailorDashboard(
  tailorId: string,
  tailorToken: string
): Promise<TailorDashboardData> {
  const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${tailorId}/dashboard`, {
    headers: {
      "Authorization": `Bearer ${tailorToken}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch dashboard data");
  }
  return res.json();
}

export async function trackClick(
  tailorId: string,
  type: "whatsapp" | "call"
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${tailorId}/track-click`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to track click");
  }
  return res.json();
}

export async function fetchLeads(
  tailorId: string,
  token: string
): Promise<DashboardLead[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/leads?tailor_id=${tailorId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch leads");
  }
  return res.json();
}
