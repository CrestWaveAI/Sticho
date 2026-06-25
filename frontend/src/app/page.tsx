"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import { 
  fetchTailors, 
  autocompleteLocations, 
  submitLead, 
  Tailor, 
  LocationInfo 
} from "./api";

const ACTIVE_CATEGORIES = [
  "Men's",
  "Women's",
  "Boutique",
  "Alterations",
  "Uniforms",
] as const;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tailorsList, setTailorsList] = useState<Tailor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<LocationInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lead Modal & Unlocked Gated contacts
  const [selectedTailorForLead, setSelectedTailorForLead] = useState<Tailor | null>(null);
  const [unlockedContacts, setUnlockedContacts] = useState<{ [tailorId: string]: string }>({});
  
  // Lead form fields
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [requirementDesc, setRequirementDesc] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState("");

  // Load unlocked contacts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("unlocked_tailors");
      if (stored) {
        setUnlockedContacts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load unlocked tailors from localStorage:", e);
    }
  }, []);

  // Fetch tailors list on query or category change
  useEffect(() => {
    async function loadTailors() {
      setIsLoading(true);
      try {
        // Query param resolution:
        // We will query by category (using first active filter if selected)
        // and match query based on freeform string
        const categoryFilter = selectedCategories.length > 0 ? selectedCategories[0] : undefined;
        
        let params: { locality?: string; city?: string; pin_code?: string; category?: string } = {
          category: categoryFilter,
        };

        const trimmedQuery = submittedQuery.trim();
        if (trimmedQuery) {
          // If it looks like a 6 digit pin code
          if (/^\d{6}$/.test(trimmedQuery)) {
            params.pin_code = trimmedQuery;
          } else {
            // Otherwise match locality name
            params.locality = trimmedQuery;
          }
        }

        const data = await fetchTailors(params);
        
        // If multiple categories are selected, filter client-side additionally
        let finalData = data;
        if (selectedCategories.length > 1) {
          finalData = data.filter((tailor) =>
            selectedCategories.every((cat) => tailor.categories.includes(cat))
          );
        }

        setTailorsList(finalData);
      } catch (err) {
        console.error("Failed to load tailors:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTailors();
  }, [submittedQuery, selectedCategories]);

  // Autocomplete fetcher
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await autocompleteLocations(searchQuery);
          setSuggestions(res);
          setShowSuggestions(true);
        } catch (e) {
          console.error("Failed to fetch autocomplete suggestions:", e);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
  };

  // Select autocomplete suggestion
  const handleSuggestionSelect = (loc: LocationInfo) => {
    const displayValue = `${loc.name}, ${loc.city}`;
    setSearchQuery(displayValue);
    setSubmittedQuery(displayValue);
    setShowSuggestions(false);
  };

  // Submit Lead Capture
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTailorForLead) return;
    setLeadError("");

    // Simple validation
    if (!customerName.trim()) {
      setLeadError("Please enter your name.");
      return;
    }
    const cleanMobile = customerMobile.replace(/\D/g, "");
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
        customer_name: customerName.trim(),
        customer_mobile: cleanMobile,
        requirement_description: requirementDesc.trim(),
      });

      if (unlockedTailor.contact_number) {
        const updatedUnlocked = {
          ...unlockedContacts,
          [unlockedTailor.id]: unlockedTailor.contact_number,
        };
        setUnlockedContacts(updatedUnlocked);
        localStorage.setItem("unlocked_tailors", JSON.stringify(updatedUnlocked));
        
        // Close modal
        setSelectedTailorForLead(null);
        setCustomerName("");
        setCustomerMobile("");
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
        <nav className="nav-links">
          <a href="#" className="nav-link active">Explore Tailors</a>
          <a href="#" className="nav-link">Bookings</a>
          <a href="#" className="nav-link">How it Works</a>
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
          {showSuggestions && suggestions.length > 0 && (
            <div className="autocomplete-dropdown">
              {suggestions.map((loc) => (
                <div 
                  key={loc.id} 
                  className="autocomplete-item"
                  onClick={() => handleSuggestionSelect(loc)}
                >
                  <span className="autocomplete-item-icon">📍</span>
                  <div className="autocomplete-item-details">
                    <span className="autocomplete-item-title">{loc.name}</span>
                    <span className="autocomplete-item-subtitle">{loc.city} ({loc.pin_code})</span>
                  </div>
                </div>
              ))}
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
            {ACTIVE_CATEGORIES.map((category) => {
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
                <div className="no-results-icon">✂</div>
                <h3 className="no-results-title">No Tailors Found</h3>
                <p className="no-results-text">
                  We couldn&apos;t find any tailors matching your search criteria. Try checking your spelling or clearing filters.
                </p>
                <button onClick={handleClearFilters} className="reset-btn">
                  Reset Search & Filters
                </button>
              </div>
            ) : (
              // Tailor cards
              tailorsList.map((tailor) => {
                const isUnlocked = tailor.id in unlockedContacts;
                const contactNumber = unlockedContacts[tailor.id];
                
                return (
                  <article key={tailor.id} className="tailor-card">
                    <div 
                      className="card-img-gradient"
                      style={{ background: tailor.gradient }}
                    >
                      <div className="card-logo">✂</div>
                    </div>
                    <div className="card-content">
                      <div className="card-top">
                        <h4 className="tailor-name">{tailor.name}</h4>
                        <div className="rating-container">
                          <span className="star-icon">★</span>
                          <span className="rating-num">{tailor.rating}</span>
                          <span className="reviews-count">({tailor.reviews_count})</span>
                        </div>
                      </div>
                      <p className="location-info">
                        {tailor.location.name}, {tailor.location.city} ({tailor.location.pin_code})
                      </p>
                      <p className="description">{tailor.bio || "No description provided."}</p>
                      <div className="tag-container">
                        {tailor.categories.map((cat) => (
                          <span key={cat} className="tag">
                            {cat}
                          </span>
                        ))}
                      </div>

                      {isUnlocked ? (
                        <div className="unlocked-container">
                          <div className="unlocked-title">
                            <span>✅ Contact Details Unlocked</span>
                          </div>
                          <span className="unlocked-phone">{contactNumber}</span>
                          <div className="contact-action-buttons">
                            <a 
                              href={`https://wa.me/${contactNumber.replace(/\D/g, "")}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="contact-action-btn whatsapp"
                            >
                              WhatsApp
                            </a>
                            <a 
                              href={`tel:${contactNumber}`} 
                              className="contact-action-btn call"
                            >
                              Call Direct
                            </a>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedTailorForLead(tailor)}
                          className="card-btn"
                        >
                          Contact Tailor
                        </button>
                      )}
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
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. 9876543210"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
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
    </div>
  );
}
