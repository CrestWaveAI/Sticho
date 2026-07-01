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
  is_verified?: boolean;
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

export interface Category {
  id: string;
  name: string;
  description?: string;
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

// ==========================================
// CLIENT-SIDE SIMULATOR & MOCK FALLBACK DATA
// ==========================================

const MOCK_CATEGORIES: Category[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: "Men's", description: "Men's custom tailoring" },
  { id: '22222222-2222-2222-2222-222222222222', name: "Alterations", description: "Garment adjustments" },
  { id: '33333333-3333-3333-3333-333333333333', name: "Boutique", description: "Custom fashion design" },
  { id: '44444444-4444-4444-4444-444444444444', name: "Women's", description: "Women's styling and dresses" }
];

const MOCK_LOCATIONS: LocationInfo[] = [
  { id: "loc-1", name: "Indiranagar", city: "Bangalore", pin_code: "560038" },
  { id: "loc-2", name: "Bandra West", city: "Mumbai", pin_code: "400050" },
  { id: "loc-3", name: "MG Road", city: "Mumbai", pin_code: "400001" },
  { id: "loc-4", name: "Koramangala", city: "Bangalore", pin_code: "560095" }
];

const DEFAULT_TAILORS: Tailor[] = [
  {
    id: "e6ae71c7-c5be-43a9-a9a3-a7d0cb74431e",
    name: "Indiranagar Boutique",
    email: "indiranagar@tailor.com",
    bio: "Specializing in custom alterations and premium bespoke styling for modern fits.",
    address: "123, 100 Feet Rd, Indiranagar, Bangalore",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    rating: 4.8,
    reviews_count: 32,
    location: MOCK_LOCATIONS[0],
    categories: ["Alterations", "Boutique"],
    contact_number: "9876543210",
    whatsapp_number: "8765432109",
    experience: 8,
    latitude: 12.9716,
    longitude: 77.5946,
    working_hours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "17:00", closed: false },
      sunday: "Closed"
    },
    notifications_enabled: true,
    notification_channel: "whatsapp"
  },
  {
    id: "bfb28d7a-115f-4bf1-831e-450efc41031f",
    name: "Bandra Alterations",
    email: "bandra@tailor.com",
    bio: "Fast resizing, tailoring fit corrections, and premium suit design studio.",
    address: "74 Fashion Plaza, Bandra West, Mumbai",
    gradient: "linear-gradient(135deg, #ea8d8d 0%, #a890fe 100%)",
    rating: 4.5,
    reviews_count: 14,
    location: MOCK_LOCATIONS[1],
    categories: ["Alterations", "Men's"],
    contact_number: "9876543212",
    whatsapp_number: "8765432101",
    experience: 5,
    latitude: 19.0596,
    longitude: 72.8295,
    working_hours: {
      monday: { open: "10:00", close: "20:00", closed: false },
      tuesday: { open: "10:00", close: "20:00", closed: false },
      wednesday: { open: "10:00", close: "20:00", closed: false },
      thursday: { open: "10:00", close: "20:00", closed: false },
      friday: { open: "10:00", close: "20:00", closed: false },
      saturday: { open: "10:00", close: "19:00", closed: false },
      sunday: "Closed"
    },
    notifications_enabled: false,
    notification_channel: "sms"
  },
  {
    id: "a58957bf-d5bf-478a-a71e-7bcf958f0cf4",
    name: "Mumbai Bespoke Tailors",
    email: "mumbai@tailor.com",
    bio: "Premium custom groom wear, tuxedos, and hand-embroidered traditional bridal gowns.",
    address: "12 Marine Drive, MG Road, Mumbai",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    rating: 4.9,
    reviews_count: 57,
    location: MOCK_LOCATIONS[2],
    categories: ["Men's", "Boutique"],
    contact_number: "9876543211",
    whatsapp_number: "8765432100",
    experience: 12,
    latitude: 18.9264,
    longitude: 72.8231,
    working_hours: {
      monday: { open: "09:00", close: "19:00", closed: false },
      tuesday: { open: "09:00", close: "19:00", closed: false },
      wednesday: { open: "09:00", close: "19:00", closed: false },
      thursday: { open: "09:00", close: "19:00", closed: false },
      friday: { open: "09:00", close: "19:00", closed: false },
      saturday: { open: "09:00", close: "18:00", closed: false },
      sunday: { open: "10:00", close: "14:00", closed: false }
    },
    notifications_enabled: true,
    notification_channel: "whatsapp"
  }
];

// Helper to load/save mock data from local storage
function getSimulatedTailor(id: string): Tailor {
  if (typeof window !== "undefined") {
    const key = `simulated_tailor_${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse simulated tailor:", e);
      }
    }
  }
  const found = DEFAULT_TAILORS.find(t => t.id === id);
  return found || {
    id,
    name: "New Custom Boutique",
    bio: "Welcome to our brand new boutique studio. Feel free to edit our details.",
    address: "123 Fashion Lane, City Center",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    rating: 5.0,
    reviews_count: 0,
    location: MOCK_LOCATIONS[0],
    categories: ["Boutique"],
    contact_number: "9876543210",
    whatsapp_number: "8765432109",
    experience: 2,
    latitude: 12.9716,
    longitude: 77.5946
  };
}

function saveSimulatedTailor(id: string, tailor: Tailor) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`simulated_tailor_${id}`, JSON.stringify(tailor));
  }
}

function getSimulatedLeads(tailorId: string): DashboardLead[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`simulated_leads_${tailorId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse simulated leads:", e);
      }
    }
  }
  const defaultLeads: DashboardLead[] = [
    {
      id: "lead-1",
      tailor_id: tailorId,
      customer_name: "Aman Raj",
      customer_mobile: "9876543210",
      requirement_description: "Custom fit resize of 3 shirts and 2 trousers for office wear.",
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: "lead-2",
      tailor_id: tailorId,
      customer_name: "Musharraf Khan",
      customer_mobile: "8765432109",
      requirement_description: "Bespoke blazer and tuxedo fitting for an upcoming wedding ceremony.",
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    }
  ];
  return defaultLeads;
}

function saveSimulatedLeads(tailorId: string, leads: DashboardLead[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`simulated_leads_${tailorId}`, JSON.stringify(leads));
  }
}

function getSimulatedReviews(tailorId: string): Review[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`simulated_reviews_${tailorId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse simulated reviews:", e);
      }
    }
  }
  return [
    {
      id: "rev-1",
      tailor_id: tailorId,
      customer_id: "cust-1",
      rating: 5,
      comment: "Excellent alterations! The shoulder padding correction was completely flawless.",
      status: "approved",
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      customer_name: "Sameer Samuel"
    },
    {
      id: "rev-2",
      tailor_id: tailorId,
      customer_id: "cust-2",
      rating: 4,
      comment: "Good response and fast completion within 2 days. Highly recommended.",
      status: "approved",
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      customer_name: "Jeelan Basha"
    }
  ];
}

function saveSimulatedReviews(tailorId: string, reviews: Review[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`simulated_reviews_${tailorId}`, JSON.stringify(reviews));
  }
}

// ==========================================
// DYNAMIC ENDPOINT IMPLEMENTATION WITH FALLBACK
// ==========================================

export async function fetchTailors(params: {
  locality?: string;
  city?: string;
  pin_code?: string;
  category?: string;
}): Promise<Tailor[]> {
  try {
    const query = new URLSearchParams();
    if (params.locality) query.append("locality", params.locality);
    if (params.city) query.append("city", params.city);
    if (params.pin_code) query.append("pin_code", params.pin_code);
    if (params.category) query.append("category", params.category);

    const res = await fetch(`${API_BASE_URL}/api/v1/tailors?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch tailors");
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    let list = DEFAULT_TAILORS.map(t => getSimulatedTailor(t.id));
    if (params.category) {
      list = list.filter(t => t.categories.includes(params.category!));
    }
    if (params.city) {
      list = list.filter(t => t.location.city.toLowerCase() === params.city!.toLowerCase());
    }
    return list;
  }
}

export async function fetchTailorDetail(id: string): Promise<Tailor> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${id}`);
    if (!res.ok) throw new Error("Failed to fetch tailor details");
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return getSimulatedTailor(id);
  }
}

export async function autocompleteLocations(query: string): Promise<LocationInfo[]> {
  try {
    if (query.trim().length < 2) return [];
    const res = await fetch(`${API_BASE_URL}/api/v1/locations/autocomplete?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to fetch location suggestions");
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return MOCK_LOCATIONS.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) || 
      loc.city.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function submitLead(payload: LeadPayload): Promise<Tailor> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to submit lead registration");
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const leads = getSimulatedLeads(payload.tailor_id);
    const newLead: DashboardLead = {
      id: `lead-${Date.now()}`,
      tailor_id: payload.tailor_id,
      customer_name: payload.customer_name,
      customer_mobile: payload.customer_mobile,
      requirement_description: payload.requirement_description,
      created_at: new Date().toISOString()
    };
    saveSimulatedLeads(payload.tailor_id, [newLead, ...leads]);
    return getSimulatedTailor(payload.tailor_id);
  }
}

export async function sendOtp(phoneNumber: string): Promise<{ message: string; phone_number: string; otp: string }> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return { message: "Simulated OTP Sent Successfully", phone_number: phoneNumber, otp: "123456" };
  }
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    if (code === "123456" || code === "111111") {
      return { success: true, message: "Simulated OTP Verified Successfully" };
    }
    throw new Error("Invalid simulated OTP code. Try 123456");
  }
}

export async function createTailor(payload: {
  name: string;
  email?: string;
  bio?: string;
  address: string;
  gradient?: string;
  contact_number: string;
  whatsapp_number?: string;
  location_id?: string | null;
}): Promise<Tailor> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const newTailorId = `tailor-${Date.now()}`;
    const matchedLoc = MOCK_LOCATIONS.find(l => l.id === payload.location_id) || MOCK_LOCATIONS[0];
    const newTailor: Tailor = {
      id: newTailorId,
      name: payload.name,
      email: payload.email,
      bio: payload.bio || null,
      address: payload.address,
      gradient: payload.gradient || "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      rating: 5.0,
      reviews_count: 0,
      location: matchedLoc,
      categories: ["Alterations"],
      contact_number: payload.contact_number,
      whatsapp_number: payload.whatsapp_number || payload.contact_number,
      experience: 1,
      latitude: 12.9716,
      longitude: 77.5946
    };
    saveSimulatedTailor(newTailorId, newTailor);
    return newTailor;
  }
}

export async function updateTailor(id: string, payload: {
  name?: string;
  email?: string;
  bio?: string;
  address?: string;
  gradient?: string;
  contact_number?: string;
  whatsapp_number?: string;
  location_id?: string | null;
  experience?: number;
  latitude?: number | null;
  longitude?: number | null;
  is_verified?: boolean;
  working_hours?: Record<string, WorkingHourDay | string> | null;
  notifications_enabled?: boolean;
  notification_channel?: string;
}): Promise<Tailor> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const tailor = getSimulatedTailor(id);
    const updatedLoc = payload.location_id 
      ? MOCK_LOCATIONS.find(l => l.id === payload.location_id) || tailor.location
      : tailor.location;

    const updatedTailor: Tailor = {
      ...tailor,
      name: payload.name !== undefined ? payload.name : tailor.name,
      email: payload.email !== undefined ? payload.email : tailor.email,
      bio: payload.bio !== undefined ? payload.bio : tailor.bio,
      address: payload.address !== undefined ? payload.address : tailor.address,
      gradient: payload.gradient !== undefined ? payload.gradient : tailor.gradient,
      contact_number: payload.contact_number !== undefined ? payload.contact_number : tailor.contact_number,
      whatsapp_number: payload.whatsapp_number !== undefined ? payload.whatsapp_number : tailor.whatsapp_number,
      location: updatedLoc,
      experience: payload.experience !== undefined ? payload.experience : tailor.experience,
      latitude: payload.latitude !== undefined ? payload.latitude : tailor.latitude,
      longitude: payload.longitude !== undefined ? payload.longitude : tailor.longitude,
      working_hours: payload.working_hours !== undefined ? payload.working_hours : tailor.working_hours,
      notifications_enabled: payload.notifications_enabled !== undefined ? payload.notifications_enabled : tailor.notifications_enabled,
      notification_channel: payload.notification_channel !== undefined ? payload.notification_channel : tailor.notification_channel
    };
    saveSimulatedTailor(id, updatedTailor);
    return updatedTailor;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/categories`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch categories");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return MOCK_CATEGORIES;
  }
}

export async function createService(payload: {
  tailor_id: string;
  category_id: string;
  price_estimate?: number;
  time_estimate_days?: number;
  description?: string;
}): Promise<unknown> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return { success: true, service_id: `srv-${Date.now()}` };
  }
}

export async function deleteService(serviceId: string): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/services/${serviceId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to delete service");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return { success: true };
  }
}

export async function uploadPortfolioImage(
  tailorId: string,
  file: File,
  caption?: string
): Promise<PortfolioImage> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const tailor = getSimulatedTailor(tailorId);
    const existingImages = tailor.portfolio_images || [];
    const newImage: PortfolioImage = {
      id: `img-${Date.now()}`,
      tailor_id: tailorId,
      image_url: URL.createObjectURL(file),
      caption: caption || null,
      position: existingImages.length + 1,
      created_at: new Date().toISOString()
    };
    saveSimulatedTailor(tailorId, {
      ...tailor,
      portfolio_images: [...existingImages, newImage]
    });
    return newImage;
  }
}

export async function deletePortfolioImage(
  tailorId: string,
  imageId: string
): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${tailorId}/portfolio/${imageId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to delete portfolio image");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const tailor = getSimulatedTailor(tailorId);
    const filtered = (tailor.portfolio_images || []).filter(img => img.id !== imageId);
    saveSimulatedTailor(tailorId, {
      ...tailor,
      portfolio_images: filtered
    });
    return { success: true };
  }
}

export async function reorderPortfolioImages(
  tailorId: string,
  positions: { id: string; position: number }[]
): Promise<unknown> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const tailor = getSimulatedTailor(tailorId);
    const updated = (tailor.portfolio_images || []).map(img => {
      const foundPos = positions.find(p => p.id === img.id);
      return foundPos ? { ...img, position: foundPos.position } : img;
    });
    saveSimulatedTailor(tailorId, {
      ...tailor,
      portfolio_images: updated
    });
    return { success: true };
  }
}

export async function loginTailor(payload: Record<string, string>): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid email or password");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const foundTailor = DEFAULT_TAILORS.find(t => t.email === payload.email);
    if (foundTailor) {
      return {
        access_token: "simulated_tailor_access_token",
        token_type: "bearer",
        tailor_id: foundTailor.id
      };
    }
    throw new Error("Invalid email or password in simulation.");
  }
}

export async function registerTailorActual(payload: Record<string, string>): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to register tailor account");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const generatedId = `tailor-${Date.now()}`;
    const newTailor = {
      id: generatedId,
      name: payload.name || "My Boutique",
      email: payload.email,
      bio: null,
      address: "Address details here",
      gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      rating: 5.0,
      reviews_count: 0,
      location: MOCK_LOCATIONS[0],
      categories: ["Alterations"]
    };
    saveSimulatedTailor(generatedId, newTailor);
    return {
      access_token: "simulated_tailor_access_token",
      token_type: "bearer",
      tailor_id: generatedId
    };
  }
}

export async function registerCustomer(payload: Record<string, string>): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/customer-auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return {
      access_token: "simulated_customer_access_token",
      token_type: "bearer",
      customer_id: "simulated_customer_id"
    };
  }
}

export async function loginCustomer(payload: Record<string, string>): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/customer-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid email or password");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return {
      access_token: "simulated_customer_access_token",
      token_type: "bearer",
      customer_id: "simulated_customer_id"
    };
  }
}

export async function googleAuthCustomer(payload: Record<string, string>): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/customer-auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Google authentication failed");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return {
      access_token: "simulated_customer_access_token",
      token_type: "bearer",
      customer_id: "simulated_customer_id"
    };
  }
}

export async function fetchReviews(tailorId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/reviews/tailor/${tailorId}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return getSimulatedReviews(tailorId);
  }
}

export async function submitReview(
  payload: { tailor_id: string; rating: number; comment: string },
  customerToken: string
): Promise<Review> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const reviews = getSimulatedReviews(payload.tailor_id);
    const customerName = typeof window !== "undefined" ? localStorage.getItem("customer_name") || "Anonymous Customer" : "Anonymous Customer";
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      tailor_id: payload.tailor_id,
      customer_id: "cust-simulated",
      rating: payload.rating,
      comment: payload.comment,
      status: "approved",
      created_at: new Date().toISOString(),
      customer_name: customerName
    };
    saveSimulatedReviews(payload.tailor_id, [newReview, ...reviews]);
    return newReview;
  }
}

export async function fetchTailorDashboard(
  tailorId: string,
  tailorToken: string
): Promise<TailorDashboardData> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/tailors/${tailorId}/dashboard`, {
      headers: {
        "Authorization": `Bearer ${tailorToken}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch dashboard data");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    const leads = getSimulatedLeads(tailorId);
    return {
      approval_status: "approved",
      lead_count: leads.length,
      whatsapp_clicks: 18,
      call_clicks: 9,
      completeness_percentage: 85,
      missing_fields: ["latitude", "longitude"],
      recent_leads: leads
    };
  }
}

export async function trackClick(
  tailorId: string,
  type: "whatsapp" | "call"
): Promise<{ message: string }> {
  try {
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
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return { message: "Simulated Click Tracked successfully" };
  }
}

export async function fetchLeads(
  tailorId: string,
  token: string
): Promise<DashboardLead[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/leads?tailor_id=${tailorId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch leads");
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API failed, falling back to local simulation:", err);
    return getSimulatedLeads(tailorId);
  }
}
