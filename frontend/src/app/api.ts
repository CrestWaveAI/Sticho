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

export interface Tailor {
  id: string;
  name: string;
  bio: string | null;
  address: string;
  gradient: string;
  rating: number;
  reviews_count: number;
  location: LocationInfo;
  categories: string[];
  services?: ServiceDetail[];
  contact_number?: string; // Gated, only unlocked after lead submission
  latitude?: number | null;
  longitude?: number | null;
  whatsapp_number?: string;
  experience?: number;
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
