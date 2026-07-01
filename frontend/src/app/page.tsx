"use client";

import React, { useState, useEffect, useTransition, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  fetchTailors, 
  autocompleteLocations, 
  submitLead, 
  fetchCategories,
  Tailor,
  LocationInfo,
  loginCustomer,
  registerCustomer,
  googleAuthCustomer,
  fetchReviews,
  submitReview,
  trackClick,
  Review
} from "./api";
import { useToast } from "@/components/ui/ToastProvider";

export interface SuggestionItem {
  id: string;
  type: "location" | "tailor" | "category";
  title: string;
  subtitle: string;
  value: string;
  data: Tailor | LocationInfo | string;
}

export default function Home() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Men's",
    "Women's",
    "Boutique",
    "Alterations",
    "Uniforms"
  ]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories();
        if (cats && cats.length > 0) {
          setCategoriesList(cats.map(c => c.name));
        }
      } catch (e) {
        console.error("Failed to load categories for filtering:", e);
      }
    }
    loadCategories();
  }, []);
  const [allTailors, setAllTailors] = useState<Tailor[]>([]);
  const [tailorsList, setTailorsList] = useState<Tailor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending] = useTransition();

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Shortlist State
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [showOnlyShortlist, setShowOnlyShortlist] = useState(false);

  // Lead Modal & Unlocked Gated contacts
  const [selectedTailorForLead, setSelectedTailorForLead] = useState<Tailor | null>(null);
  const [unlockedContacts, setUnlockedContacts] = useState<{ 
    [tailorId: string]: string | {
      contact_number: string;
      whatsapp_number?: string;
      latitude?: number | null;
      longitude?: number | null;
    } 
  }>({});
  
  // Lead form fields
  const [leadCustomerName, setLeadCustomerName] = useState("");
  const [leadCustomerMobile, setLeadCustomerMobile] = useState("");
  const [requirementDesc, setRequirementDesc] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState("");

  // Customer Auth States
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customer_token');
      const name = localStorage.getItem('customer_name') || "";
      if (token) {
        setTimeout(() => {
          setCustomerToken(token);
          setCustomerName(name);
        }, 0);
      }
    }
  }, []);

  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Reviews States
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [reviewsData, setReviewsData] = useState<Record<string, Review[]>>({});
  const [loadingReviews, setLoadingReviews] = useState<Record<string, boolean>>({});
  const [tempRating, setTempRating] = useState<Record<string, number>>({});
  const [tempComment, setTempComment] = useState<Record<string, string>>({});
  const [submittingReview, setSubmittingReview] = useState<Record<string, boolean>>({});

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_id');
    setCustomerToken(null);
    setCustomerName("");
    addToast('Logged out of customer account.', 'info');
  };

  const handleCustomerAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoadingAuth(true);
    try {
      let res;
      if (authMode === 'signup') {
        if (!authForm.name || !authForm.email || !authForm.password) {
          setAuthError("All fields are required.");
          setIsLoadingAuth(false);
          return;
        }
        res = await registerCustomer({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password
        });
      } else {
        if (!authForm.email || !authForm.password) {
          setAuthError("Email and password are required.");
          setIsLoadingAuth(false);
          return;
        }
        res = await loginCustomer({
          email: authForm.email,
          password: authForm.password
        });
      }

      const nameVal = authMode === 'signup' ? authForm.name : authForm.email.split('@')[0];
      
      localStorage.setItem('customer_token', res.access_token);
      localStorage.setItem('customer_name', nameVal);
      localStorage.setItem('customer_id', res.customer_id!);
      
      setCustomerToken(res.access_token);
      setCustomerName(nameVal);
      
      setIsCustomerAuthOpen(false);
      setAuthForm({ name: "", email: "", password: "" });
      addToast(authMode === 'signup' ? 'Registered and logged in!' : 'Logged in successfully!', 'success');
    } catch (err) {
      console.error(err);
      setAuthError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    setIsLoadingAuth(true);
    try {
      const res = await googleAuthCustomer({
        email: "google.customer@gmail.com",
        name: "Google Customer",
        google_id: "google-oauth-id-1234"
      });

      localStorage.setItem('customer_token', res.access_token);
      localStorage.setItem('customer_name', "Google Customer");
      localStorage.setItem('customer_id', res.customer_id!);
      
      setCustomerToken(res.access_token);
      setCustomerName("Google Customer");
      
      setIsCustomerAuthOpen(false);
      addToast('Signed in with Google!', 'success');
    } catch (err) {
      console.error(err);
      setAuthError(err instanceof Error ? err.message : "Google authentication failed.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const toggleReviewsCollapse = async (tailorId: string) => {
    const isExpanded = !expandedReviews[tailorId];
    setExpandedReviews(prev => ({ ...prev, [tailorId]: isExpanded }));

    if (isExpanded && !reviewsData[tailorId]) {
      setLoadingReviews(prev => ({ ...prev, [tailorId]: true }));
      try {
        const reviews = await fetchReviews(tailorId);
        setReviewsData(prev => ({ ...prev, [tailorId]: reviews }));
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoadingReviews(prev => ({ ...prev, [tailorId]: false }));
      }
    }
  };

  const handleSelectStar = (tailorId: string, star: number) => {
    setTempRating(prev => ({ ...prev, [tailorId]: star }));
  };

  const handleCommentChange = (tailorId: string, comment: string) => {
    setTempComment(prev => ({ ...prev, [tailorId]: comment }));
  };

  const handleReviewSubmit = async (e: React.FormEvent, tailorId: string) => {
    e.preventDefault();
    if (!customerToken) return;

    const rating = tempRating[tailorId] || 5;
    const comment = tempComment[tailorId] || "";

    setSubmittingReview(prev => ({ ...prev, [tailorId]: true }));
    try {
      const newReview = await submitReview({
        tailor_id: tailorId,
        rating,
        comment
      }, customerToken);

      addToast("Review submitted successfully!", "success");
      setTempComment(prev => ({ ...prev, [tailorId]: "" }));
      setTempRating(prev => ({ ...prev, [tailorId]: 5 }));
      
      setReviewsData(prev => ({
        ...prev,
        [tailorId]: [newReview, ...(prev[tailorId] || [])]
      }));

      // Update ratings count and average rating locally
      setTailorsList(prevList => 
        prevList.map(t => {
          if (t.id === tailorId) {
            const currentCount = t.reviews_count || 0;
            const currentRating = t.rating || 0.0;
            const newCount = currentCount + 1;
            const newRating = parseFloat(((currentRating * currentCount + rating) / newCount).toFixed(1));
            return {
              ...t,
              reviews_count: newCount,
              rating: newRating
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : "Failed to submit review.", "error");
    } finally {
      setSubmittingReview(prev => ({ ...prev, [tailorId]: false }));
    }
  };

  const handleTrackClick = async (tailorId: string, type: "whatsapp" | "call") => {
    try {
      await trackClick(tailorId, type);
    } catch (err) {
      console.error("Failed to track click:", err);
    }
  };


  // Load unlocked contacts & shortlists from localStorage on mount & prefetch tailors for instant autocomplete
  useEffect(() => {
    try {
      const stored = localStorage.getItem("unlocked_tailors");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setUnlockedContacts(parsed);
        }, 0);
      }
    } catch (e) {
      console.error("Failed to load unlocked tailors from localStorage:", e);
    }

    try {
      const storedShortlist = localStorage.getItem("shortlisted_tailors");
      if (storedShortlist) {
        const parsed = JSON.parse(storedShortlist);
        setTimeout(() => {
          setShortlistedIds(parsed);
        }, 0);
      }
    } catch (e) {
      console.error("Failed to load shortlist from localStorage:", e);
    }

    async function loadAllTailors() {
      try {
        const res = await fetchTailors({});
        setAllTailors(res);
      } catch (e) {
        console.error("Failed to prefetch tailors for autocomplete:", e);
      }
    }
    loadAllTailors();
  }, []);

  // Fetch tailors list on query or category change (Universal Search client-side parsing)
  useEffect(() => {
    async function loadTailors() {
      setIsLoading(true);
      try {
        const categoryFilter = selectedCategories.length > 0 ? selectedCategories[0] : undefined;
        const params: { category?: string } = {
          category: categoryFilter,
        };

        const data = await fetchTailors(params);
        
        let finalData = data;
        const trimmedQuery = submittedQuery.trim().toLowerCase();
        if (trimmedQuery) {
          if (/^\d{6}$/.test(trimmedQuery)) {
            finalData = data.filter(t => t.location?.pin_code === trimmedQuery);
          } else if (trimmedQuery.includes(",")) {
            const parts = trimmedQuery.split(",");
            const locQuery = parts[0]?.trim().toLowerCase() || "";
            const cityQuery = parts[1]?.trim().toLowerCase() || "";
            finalData = data.filter(t => 
              t.location && 
              (t.location.name.toLowerCase().includes(locQuery) || locQuery.includes(t.location.name.toLowerCase())) &&
              (t.location.city.toLowerCase().includes(cityQuery) || cityQuery.includes(t.location.city.toLowerCase()))
            );
          } else {
            // Universal Search Match across names, bio, locations, and categories
            finalData = data.filter(t => 
              t.name.toLowerCase().includes(trimmedQuery) ||
              (t.bio && t.bio.toLowerCase().includes(trimmedQuery)) ||
              (t.location && (
                t.location.name.toLowerCase().includes(trimmedQuery) ||
                t.location.city.toLowerCase().includes(trimmedQuery) ||
                t.location.pin_code.includes(trimmedQuery)
              )) ||
              t.categories.some(c => c.toLowerCase().includes(trimmedQuery))
            );
          }
        }

        // If multiple categories are selected, filter client-side additionally
        if (selectedCategories.length > 1) {
          finalData = finalData.filter((tailor) =>
            selectedCategories.every((cat) => tailor.categories.includes(cat))
          );
        }

        // Filter by shortlist if active
        if (showOnlyShortlist) {
          finalData = finalData.filter((tailor) => shortlistedIds.includes(tailor.id));
        }

        setTailorsList(finalData);
      } catch (err) {
        console.error("Failed to load tailors:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTailors();
  }, [submittedQuery, selectedCategories, showOnlyShortlist, shortlistedIds]);

  // Autocomplete fetcher (Universal search over locations, shop names, and categories)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = searchQuery.trim().toLowerCase();
      if (query.length >= 2) {
        setIsLoadingSuggestions(true);
        try {
          // 1. Fetch location suggestions from API
          const locRes = await autocompleteLocations(searchQuery);
          const locationSuggestions: SuggestionItem[] = locRes.map(loc => ({
            id: `loc-${loc.id}`,
            type: "location",
            title: loc.name,
            subtitle: `${loc.city} (${loc.pin_code})`,
            value: `${loc.name}, ${loc.city}`,
            data: loc
          }));

          // 2. Filter tailors/shops in memory
          const tailorSuggestions: SuggestionItem[] = allTailors
            .filter(t => t.name.toLowerCase().includes(query) || (t.bio && t.bio.toLowerCase().includes(query)))
            .map(t => ({
              id: `tailor-${t.id}`,
              type: "tailor",
              title: t.name,
              subtitle: t.bio ? (t.bio.length > 50 ? `${t.bio.substring(0, 48)}...` : t.bio) : "Shop Profile",
              value: t.name,
              data: t
            }));

          // 3. Filter categories in memory
          const categorySuggestions: SuggestionItem[] = categoriesList
            .filter(c => c.toLowerCase().includes(query))
            .map(c => ({
              id: `cat-${c}`,
              type: "category",
              title: c,
              subtitle: "Service Category",
              value: c,
              data: c
            }));

          setSuggestions([...tailorSuggestions, ...categorySuggestions, ...locationSuggestions]);
          setShowSuggestions(true);
          setActiveIndex(-1);
        } catch (e) {
          console.error("Failed to fetch autocomplete suggestions:", e);
          setSuggestions([]);
          setShowSuggestions(true);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoadingSuggestions(false);
        setActiveIndex(-1);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, allTailors, categoriesList]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setActiveIndex(-1);
    setSubmittedQuery(searchQuery.trim());
  };

  // Toggle category filters
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    setSelectedCategories([]);
    setShowOnlyShortlist(false);
  };

  // Select autocomplete suggestion
  const handleSuggestionSelect = useCallback((item: SuggestionItem) => {
    if (item.type === "category") {
      // For categories, activate category filter chip and reset search inputs
      setSelectedCategories([item.data as string]);
      setSearchQuery("");
      setSubmittedQuery("");
    } else {
      // For tailors and locations, set search input and execute search
      setSearchQuery(item.value);
      setSubmittedQuery(item.value);
    }
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, []);

  // Toggle saving/shortlisting tailors
  const toggleShortlist = useCallback((tailorId: string) => {
    setShortlistedIds((prev) => {
      const next = prev.includes(tailorId)
        ? prev.filter((id) => id !== tailorId)
        : [...prev, tailorId];
      localStorage.setItem("shortlisted_tailors", JSON.stringify(next));
      return next;
    });
  }, []);

  // Keyboard navigation for autocomplete
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, activeIndex, handleSuggestionSelect]);

  // Submit Lead Capture
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTailorForLead) return;
    setLeadError("");

    // Simple validation
    if (!leadCustomerName.trim()) {
      setLeadError("Please enter your name.");
      return;
    }
    const cleanMobile = leadCustomerMobile.replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      setLeadError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!requirementDesc.trim()) {
      setLeadError("Please describe your stitching requirements.");
      return;
    }

    setIsSubmittingLead(true);
    try {
      const unlockedTailor = await submitLead({
        tailor_id: selectedTailorForLead.id,
        customer_name: leadCustomerName.trim(),
        customer_mobile: cleanMobile,
        requirement_description: requirementDesc.trim(),
      });

      if (unlockedTailor.contact_number) {
        const updatedUnlocked = {
          ...unlockedContacts,
          [unlockedTailor.id]: {
            contact_number: unlockedTailor.contact_number,
            whatsapp_number: unlockedTailor.whatsapp_number || unlockedTailor.contact_number,
            latitude: unlockedTailor.latitude,
            longitude: unlockedTailor.longitude,
          },
        };
        setUnlockedContacts(updatedUnlocked);
        localStorage.setItem("unlocked_tailors", JSON.stringify(updatedUnlocked));
        
        // Close modal
        setSelectedTailorForLead(null);
        setLeadCustomerName("");
        setLeadCustomerMobile("");
        setRequirementDesc("");
      } else {
        setLeadError("Failed to retrieve tailor contact info. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit lead:", err);
      setLeadError("Error registering your lead. Please try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div>
      {/* Navigation Header */}
      <header className="header">
        <div className="logo-container">
          <Image
            src="/logo.png"
            alt="Stichoh Logo"
            width={40}
            height={40}
            priority
            style={{ borderRadius: "8px" }}
          />
          <span className="logo-text">Stichoh</span>
        </div>
        <nav className="nav-links" style={{ alignItems: "center" }}>
          <button 
            onClick={() => setShowOnlyShortlist(false)} 
            className={`nav-link-btn ${!showOnlyShortlist ? "active" : ""}`}
          >
            Explore Tailors
          </button>
          <button 
            onClick={() => setShowOnlyShortlist(true)} 
            className={`nav-link-btn ${showOnlyShortlist ? "active" : ""}`}
          >
            My Shortlist
            {shortlistedIds.length > 0 && (
              <span className="shortlist-badge">{shortlistedIds.length}</span>
            )}
          </button>
           <a href="#" className="nav-link">Bookings</a>
          <a href="#" className="nav-link">How it Works</a>
          {customerToken ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="nav-link" style={{ cursor: "default" }}>👋 {customerName}</span>
              <button 
                onClick={handleCustomerLogout} 
                className="nav-link-btn" 
                style={{ fontSize: "0.85rem", opacity: 0.8 }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setIsCustomerAuthOpen(true); }} 
              className="nav-link-btn" 
              style={{ fontSize: "0.85rem" }}
            >
              Customer Sign In
            </button>
          )}
          <Link href="/register" className="nav-link">Join as Partner</Link>
          <Link href="/dashboard" className="nav-btn">Tailor Portal</Link>
        </nav>
      </header>

      {/* Hero Search Section */}
      <section className="hero">
        <div 
          className="hero-bg"
          style={{ backgroundImage: "url('/hero.png')" }}
        />
        <div className="hero-overlay" />
        
        <span className="hero-badge">Bespoke Tailoring Network</span>
        <h1 className="hero-title">
          Search Premium Tailors <span>by Location</span>
        </h1>
        <p className="hero-subtitle">
          Find, filter, and connect with custom tailors and boutiques near you for the perfect fit.
        </p>

        {/* Search Bar Container */}
        <div className="search-container" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <svg 
                className="search-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Enter City, Locality, or PIN Code (e.g. Bangalore, Indiranagar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                aria-controls="autocomplete-listbox"
                aria-activedescendant={activeIndex >= 0 ? `autocomplete-option-${activeIndex}` : undefined}
              />
            </div>
            <button type="submit" className="search-button">
              <span>Search</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && (
            <div className="autocomplete-dropdown" id="autocomplete-listbox" role="listbox">
              {isLoadingSuggestions ? (
                <div className="autocomplete-loading">
                  <span className="autocomplete-loading-dot"></span>
                  <span className="autocomplete-loading-dot"></span>
                  <span className="autocomplete-loading-dot"></span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((item, index) => {
                  let icon = "📍";
                  let badgeClass = "autocomplete-badge-location";
                  let badgeText = "Location";
                  if (item.type === "tailor") {
                    icon = "🏪";
                    badgeClass = "autocomplete-badge-shop";
                    badgeText = "Shop";
                  } else if (item.type === "category") {
                    icon = "🏷️";
                    badgeClass = "autocomplete-badge-category";
                    badgeText = "Category";
                  }

                  return (
                    <div 
                      key={item.id}
                      id={`autocomplete-option-${index}`}
                      className={`autocomplete-item${index === activeIndex ? " autocomplete-item--active" : ""}`}
                      onClick={() => handleSuggestionSelect(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      aria-selected={index === activeIndex}
                    >
                      <div className="autocomplete-item-left">
                        <div className="autocomplete-item-icon-wrapper">
                          {icon}
                        </div>
                        <div className="autocomplete-item-details">
                          <span className="autocomplete-item-title">{item.title}</span>
                          <span className="autocomplete-item-subtitle">{item.subtitle}</span>
                        </div>
                      </div>
                      <span className={`autocomplete-badge ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="autocomplete-empty">
                  <span className="autocomplete-empty-icon">🔍</span>
                  <span>No matches found</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="main-layout">
        {/* Sidebar / Filter Panel */}
        <aside className="filter-panel">
          <div className="filter-header">
            <h3 className="filter-title">Categories</h3>
            {(submittedQuery || selectedCategories.length > 0) && (
              <button onClick={handleClearFilters} className="clear-btn">
                Clear Filters
              </button>
            )}
          </div>
          <div className="filter-group">
            {categoriesList.map((category) => {
              const isChecked = selectedCategories.includes(category);
              return (
                <label 
                  key={category} 
                  className="filter-option"
                  onClick={() => handleCategoryToggle(category)}
                >
                  <div className={`checkbox-custom ${isChecked ? "checked" : ""}`}>
                    {isChecked && <div className="checkmark" />}
                  </div>
                  <span>{category}</span>
                </label>
              );
            })}
          </div>
        </aside>

        {/* Listings display */}
        <section className="listings-container">
          <div className="results-info">
            <h2 className="results-count">
              {isLoading || isPending ? (
                "Updating listings..."
              ) : showOnlyShortlist ? (
                <>
                  Showing <span>{tailorsList.length}</span> saved tailor{tailorsList.length !== 1 ? "s" : ""} in shortlist
                </>
              ) : (
                <>
                  Showing <span>{tailorsList.length}</span> tailor{tailorsList.length !== 1 ? "s" : ""}
                  {submittedQuery && ` in "${submittedQuery}"`}
                </>
              )}
            </h2>
            {selectedCategories.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {selectedCategories.map((cat) => (
                  <span key={cat} className="tag">{cat}</span>
                ))}
              </div>
            )}
          </div>

          <div className="tailor-grid">
            {isLoading || isPending ? (
              // Skeleton loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-content">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-location" />
                    <div className="skeleton-line skeleton-desc" />
                    <div className="skeleton-line skeleton-tags" />
                    <div className="skeleton-line skeleton-btn" />
                  </div>
                </div>
              ))
            ) : tailorsList.length === 0 ? (
              // Clean "No Results" state
              <div className="no-results">
                <div className="no-results-icon">{showOnlyShortlist ? "❤️" : "✂"}</div>
                <h3 className="no-results-title">
                  {showOnlyShortlist ? "Your Shortlist is Empty" : "No Tailors Found"}
                </h3>
                <p className="no-results-text">
                  {showOnlyShortlist 
                    ? "Browse through our premium tailors and tap the heart icon on any profile card to save them here for quick comparison!" 
                    : "We couldn't find any tailors matching your search criteria. Try checking your spelling or clearing filters."}
                </p>
                <button onClick={handleClearFilters} className="reset-btn">
                  {showOnlyShortlist ? "Browse All Tailors" : "Reset Search & Filters"}
                </button>
              </div>
            ) : (
              // Tailor cards
              tailorsList.map((tailor) => {
                const isUnlocked = tailor.id in unlockedContacts;
                
                return (
                  <article key={tailor.id} className="tailor-card">
                    <div 
                      className="card-img-gradient"
                      style={{ background: tailor.gradient }}
                    >
                      <Link href={`/profile/${tailor.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                        <div className="card-logo">✂</div>
                      </Link>
                      <button
                        className={`bookmark-btn ${shortlistedIds.includes(tailor.id) ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleShortlist(tailor.id);
                        }}
                        aria-label={shortlistedIds.includes(tailor.id) ? "Remove from Shortlist" : "Save to Shortlist"}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={shortlistedIds.includes(tailor.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                    </div>
                    <div className="card-content">
                      <Link href={`/profile/${tailor.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className="card-top">
                          <h4 className="tailor-name">{tailor.name}</h4>
                          <div className="rating-container">
                            <span className="star-icon">★</span>
                            <span className="rating-num">{tailor.rating}</span>
                            <span className="reviews-count">({tailor.reviews_count})</span>
                          </div>
                        </div>
                        <p className="location-info">
                          {tailor.location ? `${tailor.location.name}, ${tailor.location.city} (${tailor.location.pin_code})` : 'Location not specified'}
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", gap: "0.25rem", alignItems: "center" }}>
                          <span>🕒 Hours Today:</span>
                          <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                            {(() => {
                              if (!tailor.working_hours) return "Not specified";
                              
                              // Get current day of week in lowercase
                              const currentDay = new Date()
                                .toLocaleDateString("en-US", { weekday: "long" })
                                .toLowerCase();
                                
                              const dayData = tailor.working_hours[currentDay];
                              
                              if (!dayData) {
                                const daysShort = new Date().toLocaleDateString("en-US", { weekday: "short" });
                                const legacyMatch = Object.entries(tailor.working_hours).find(([key]) => {
                                  const cleanKey = key.toLowerCase();
                                  return cleanKey.includes(daysShort.toLowerCase()) || 
                                         (cleanKey.includes("mon") && cleanKey.includes("sat") && daysShort !== "Sun");
                                });
                                if (legacyMatch) {
                                  return legacyMatch[1] as string;
                                }
                                return "Not specified";
                              }
                              
                              if (typeof dayData === "string") {
                                return dayData;
                              }
                              
                              if (dayData.closed) {
                                return "Closed";
                              }
                              
                              if (dayData.open && dayData.close) {
                                const formatTime12h = (timeStr: string) => {
                                  const [hourStr, minStr] = timeStr.split(":");
                                  const hour = parseInt(hourStr);
                                  const suffix = hour >= 12 ? "PM" : "AM";
                                  const hour12 = hour % 12 || 12;
                                  return `${hour12}:${minStr} ${suffix}`;
                                };
                                return `${formatTime12h(dayData.open)} - ${formatTime12h(dayData.close)}`;
                              }
                              
                              return "Not specified";
                            })()}
                          </span>
                        </p>
                        <p className="description">{tailor.bio || "No description provided."}</p>
                        <div className="tag-container">
                          {tailor.categories.map((cat) => (
                            <span key={cat} className="tag">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </Link>

                      {isUnlocked ? (
                        <div className="unlocked-container">
                          <div className="unlocked-title">
                            <span>✅ Contact Details Unlocked</span>
                          </div>
                          {(() => {
                            const contact = unlockedContacts[tailor.id];
                            const phone = typeof contact === "string" ? contact : (contact?.contact_number || "");
                            const whatsapp = typeof contact === "string" ? contact : (contact?.whatsapp_number || contact?.contact_number || "");
                            const lat = typeof contact === "string" ? null : (contact?.latitude ?? null);
                            const lng = typeof contact === "string" ? null : (contact?.longitude ?? null);

                            return (
                              <>
                                <div className="unlocked-details">
                                  <div className="unlocked-detail-item">
                                    <span className="unlocked-label">📞 Call:</span>
                                    <span className="unlocked-val">{phone}</span>
                                  </div>
                                  <div className="unlocked-detail-item">
                                    <span className="unlocked-label">💬 WhatsApp:</span>
                                    <span className="unlocked-val">{whatsapp}</span>
                                  </div>
                                  <div className="unlocked-detail-item">
                                    <span className="unlocked-label">📍 Address:</span>
                                    <span className="unlocked-val">{tailor.address}</span>
                                  </div>
                                  {lat !== null && lng !== null && (
                                    <div className="unlocked-detail-item">
                                      <span className="unlocked-label">🗺️ Map Pin:</span>
                                      <span className="unlocked-val">
                                        <a 
                                          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="map-link"
                                        >
                                          View on Google Maps ({lat.toFixed(4)}, {lng.toFixed(4)})
                                        </a>
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="contact-action-buttons">
                                  <a 
                                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={() => handleTrackClick(tailor.id, "whatsapp")}
                                    className="contact-action-btn whatsapp"
                                  >
                                    WhatsApp
                                  </a>
                                  <a 
                                    href={`tel:${phone}`} 
                                    onClick={() => handleTrackClick(tailor.id, "call")}
                                    className="contact-action-btn call"
                                  >
                                    Call Direct
                                  </a>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedTailorForLead(tailor)}
                          className="card-btn"
                        >
                          Contact Tailor
                        </button>
                      )}

                      {/* Collapsible Reviews Panel */}
                      <div style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            toggleReviewsCollapse(tailor.id);
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            background: "none",
                            border: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "var(--color-primary)",
                            cursor: "pointer"
                          }}
                        >
                          <span>💬 Reviews ({tailor.reviews_count || 0})</span>
                          <span>{expandedReviews[tailor.id] ? "▲" : "▼"}</span>
                        </button>

                        {expandedReviews[tailor.id] && (
                          <div style={{ marginTop: "0.75rem" }}>
                            {/* Reviews List */}
                            {loadingReviews[tailor.id] ? (
                              <div style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", padding: "0.5rem 0" }}>Loading reviews...</div>
                            ) : !reviewsData[tailor.id] || reviewsData[tailor.id].length === 0 ? (
                              <div style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", padding: "0.5rem 0" }}>No reviews yet. Be the first to leave one!</div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "150px", overflowY: "auto", marginBottom: "0.75rem", paddingRight: "0.25rem" }}>
                                {reviewsData[tailor.id].map((rev) => (
                                  <div key={rev.id} style={{ fontSize: "0.8rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 500, marginBottom: "0.15rem" }}>
                                      <span style={{ color: "var(--color-ink)" }}>{rev.customer_name}</span>
                                      <span style={{ color: "#fbbf24" }}>{"★".repeat(rev.rating)}</span>
                                    </div>
                                    <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>{rev.comment}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Submit Review Form */}
                            <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                              <h5 style={{ fontSize: "0.8rem", margin: "0 0 0.5rem 0", fontWeight: 600, color: "var(--color-ink)" }}>Write a Review</h5>
                              {customerToken ? (
                                <form onSubmit={(e) => handleReviewSubmit(e, tailor.id)} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                  <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)" }}>Rating:</span>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleSelectStar(tailor.id, star)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          cursor: "pointer",
                                          fontSize: "1.1rem",
                                          padding: 0,
                                          color: star <= (tempRating[tailor.id] || 5) ? "#fbbf24" : "#d1d5db"
                                        }}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    placeholder="Share your experience with this tailor..."
                                    value={tempComment[tailor.id] || ""}
                                    onChange={(e) => handleCommentChange(tailor.id, e.target.value)}
                                    required
                                    rows={2}
                                    style={{
                                      width: "100%",
                                      fontSize: "0.8rem",
                                      padding: "0.4rem",
                                      border: "1px solid var(--color-border)",
                                      borderRadius: "4px",
                                      background: "var(--color-surface)",
                                      color: "var(--color-ink)",
                                      fontFamily: "inherit"
                                    }}
                                  />
                                  <button
                                    type="submit"
                                    disabled={submittingReview[tailor.id]}
                                    style={{
                                      alignSelf: "flex-end",
                                      padding: "0.3rem 0.75rem",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                      color: "white",
                                      backgroundColor: "var(--color-primary)",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer"
                                    }}
                                  >
                                    {submittingReview[tailor.id] ? "Submitting..." : "Submit"}
                                  </button>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsCustomerAuthOpen(true)}
                                  style={{
                                    width: "100%",
                                    padding: "0.4rem",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    border: "1px solid var(--color-primary)",
                                    borderRadius: "4px",
                                    color: "var(--color-primary)",
                                    background: "none",
                                    cursor: "pointer"
                                  }}
                                >
                                  Sign In as Customer to Review
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Lead Capture Modal */}
      {selectedTailorForLead && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button 
              onClick={() => setSelectedTailorForLead(null)}
              className="modal-close"
            >
              &times;
            </button>
            <h3 className="modal-title">Contact {selectedTailorForLead.name}</h3>
            <p className="modal-subtitle">
              Submit your contact details and requirements to unlock this tailor&apos;s contact information.
            </p>

            <form onSubmit={handleLeadSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={leadCustomerName}
                  onChange={(e) => setLeadCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. 9876543210"
                  value={leadCustomerMobile}
                  onChange={(e) => setLeadCustomerMobile(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">What do you want stitched/altered?</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="e.g. Need a custom-fit wedding suit stitched with premium velvet lapels."
                  value={requirementDesc}
                  onChange={(e) => setRequirementDesc(e.target.value)}
                  required
                />
              </div>

              {leadError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.5rem", textAlign: "left" }}>
                  ⚠️ {leadError}
                </div>
              )}

              <button 
                type="submit" 
                className="form-submit-btn"
                disabled={isSubmittingLead}
              >
                {isSubmittingLead ? "Submitting..." : "Unlock Contact Details"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Customer Authentication Modal */}
      {isCustomerAuthOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: "400px" }}>
            <button 
              onClick={() => { setIsCustomerAuthOpen(false); setAuthError(""); }}
              className="modal-close"
            >
              &times;
            </button>
            <h3 className="modal-title" style={{ textAlign: "center" }}>
              {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
            </h3>
            <p className="modal-subtitle" style={{ textAlign: "center" }}>
              {authMode === 'login' ? 'Sign in to write reviews and unlock tailor services.' : 'Join as a customer to rate tailors and save reviews.'}
            </p>

            <form onSubmit={handleCustomerAuthSubmit}>
              {authMode === 'signup' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Priya Sharma"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. priya@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                />
              </div>

              {authError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: "0.5rem", textAlign: "center" }}>
                  ⚠️ {authError}
                </div>
              )}

              <button 
                type="submit" 
                className="form-submit-btn"
                disabled={isLoadingAuth}
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                {isLoadingAuth ? "Authenticating..." : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div style={{ margin: "1rem 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ height: "1px", flex: 1, backgroundColor: "var(--color-border)" }} />
                <span style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)", padding: "0 0.75rem" }}>or</span>
                <span style={{ height: "1px", flex: 1, backgroundColor: "var(--color-border)" }} />
              </div>

              <button 
                type="button" 
                onClick={handleGoogleAuth}
                className="form-submit-btn"
                style={{ 
                  width: "100%", 
                  backgroundColor: "white", 
                  color: "#374151", 
                  border: "1px solid #d1d5db",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              <p style={{ fontSize: "0.85rem", textAlign: "center", color: "var(--color-ink-muted)", margin: 0 }}>
                {authMode === 'login' ? "New customer? " : "Already have a customer account? "}
                <button 
                  type="button" 
                  onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(""); }}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "var(--color-primary)", 
                    fontWeight: 500, 
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  {authMode === 'login' ? 'Sign up here' : 'Log in here'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
