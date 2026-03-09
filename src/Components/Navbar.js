import React, { useEffect, useRef, useState } from "react";
import logoImage from "../assest/image.png";

function Navbar({ onSearch, countries = [], selectedCountry, onCountryChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firstRender = useRef(true);

  const handleSearch = () => {
    onSearch(searchQuery.trim());
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      onSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleCountrySelect = (countryCode) => {
    onCountryChange(countryCode);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar bg-dark navbar-expand-lg position-relative">
      <div className="container-fluid d-flex flex-nowrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center flex-shrink-0">
          <button
            type="button"
            className="btn btn-outline-light d-lg-none me-2"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            &#9776;
          </button>

          {/* Logo / Brand */}
          <a
            className="navbar-brand text-light d-flex align-items-center mb-0"
            href="./"
          >
            <img
              src={logoImage}
              alt="Xpress Logo"
              width="36"
              height="36"
              className="me-0 me-sm-2 rounded bg-transparent flex-shrink-0"
            />
            <span className="fw-semibold d-none d-sm-inline">Xpress</span>
          </a>
        </div>

        {/* Nav links (hidden on small screens) */}
        <ul className="navbar-nav d-none d-lg-flex flex-row mb-0 align-items-center">
          <li className="nav-item mx-2">
            <a className="nav-link active text-light" aria-current="page" href="./">
              Home
            </a>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link text-light" href="./">
              Link
            </a>
          </li>
          <li className="nav-item mx-2 d-flex align-items-center">
            <select
              className="form-select form-select-sm"
              style={{ minWidth: "170px" }}
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value)}
              aria-label="Select country"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </li>
        </ul> 

        {/* Search bar */}
        <div className="d-flex align-items-center flex-grow-1 ms-1">
          <input
            type="text"
            className="form-control form-control-sm me-2"
            style={{ minWidth: 0 }}
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <button className="btn btn-primary btn-sm flex-shrink-0" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div
        className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
        style={{
          zIndex: 1080,
          pointerEvents: isMenuOpen ? "auto" : "none",
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
          style={{
            opacity: isMenuOpen ? 0.45 : 0,
            transition: "opacity 0.25s ease-in-out",
          }}
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          className="position-absolute top-0 start-0 h-100 bg-dark border-end border-secondary p-3"
          style={{
            width: "280px",
            transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease-in-out",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-light fw-semibold">Menu</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>

          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className="nav-link text-light"
                href="./"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-light"
                href="./"
                onClick={() => setIsMenuOpen(false)}
              >
                Link
              </a>
            </li>
            <li className="nav-item mt-3">
              <label className="text-light small mb-1 d-block">Country</label>
              <select
                className="form-select form-select-sm"
                value={selectedCountry}
                onChange={(e) => handleCountrySelect(e.target.value)}
                aria-label="Select country"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.label}
                  </option>
                ))}
              </select>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
