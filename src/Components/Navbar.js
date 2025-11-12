import React, { useState } from "react";

function Navbar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search term!");
      return;
    }
    onSearch(searchQuery); // send query to parent
  };

  return (
    <nav className="navbar bg-dark navbar-expand-lg">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo / Brand */}
        <a className="navbar-brand text-light" href="./News.js">
          Xpress
        </a>

        {/* Nav links */}
        <ul className="navbar-nav d-flex flex-row mb-0">
          <li className="nav-item mx-2">
            <a className="nav-link active text-light" aria-current="page" href="./News.js">
              Home
            </a>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link text-light" href="#">
              Link
            </a>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link disabled text-light" aria-disabled="true">
              Disabled
            </a>
          </li>
        </ul>

        {/* Search bar */}
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
