"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { tailors, Tailor } from "./tailorsData";

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
  const [filteredTailors, setFilteredTailors] = useState<Tailor[]>(tailors);
  
  // We use simulated loading to represent async loading < 2s on broadband
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API network delay (< 2s, e.g., 500ms)
    setTimeout(() => {
      setSubmittedQuery(searchQuery.trim());
      setIsLoading(false);
    }, 500);
  };

  // Perform filtering & search matches
  useEffect(() => {
    startTransition(() => {
      let results = tailors;

      // 1. Geography Filter (City, Locality, or PIN Code)
      if (submittedQuery) {
        const query = submittedQuery.toLowerCase();
        results = results.filter(
          (tailor) =>
            tailor.city.toLowerCase().includes(query) ||
            tailor.locality.toLowerCase().includes(query) ||
            tailor.pinCode.includes(query)
        );
      }

      // 2. Category Filter
      if (selectedCategories.length > 0) {
        results = results.filter((tailor) =>
          selectedCategories.some((cat) => (tailor.categories as string[]).includes(cat))
        );
      }

      setFilteredTailors(results);
    });
  }, [submittedQuery, selectedCategories]);

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
          Find, filter, and book custom tailors and boutiques near you for the perfect fit.
        </p>

        {/* Search Bar Container */}
        <div className="search-container">
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
                placeholder="Enter City, Locality, or PIN Code (e.g. Bangalore, Indiranagar, 560034)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  Showing <span>{filteredTailors.length}</span> tailor{filteredTailors.length !== 1 ? "s" : ""}
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
            ) : filteredTailors.length === 0 ? (
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
              filteredTailors.map((tailor) => (
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
                        <span className="reviews-count">({tailor.reviews})</span>
                      </div>
                    </div>
                    <p className="location-info">
                      {tailor.locality}, {tailor.city} ({tailor.pinCode})
                    </p>
                    <p className="description">{tailor.description}</p>
                    <div className="tag-container">
                      {tailor.categories.map((cat) => (
                        <span key={cat} className="tag">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <button className="card-btn">
                      Book Appointment
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
