import React, { useState, useEffect } from 'react';
import { Search, MapPin, Beer, Phone, Globe } from 'lucide-react';
import './index.css';
import './App.css';

const API_KEY = import.meta.env.VITE_APP_API_KEY;

function App() {
  const [breweries, setBreweries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreweries = async () => {
      try {
        const response = await fetch(`https://api.openbrewerydb.org/v1/breweries?per_page=50&key=${API_KEY}`);
        const data = await response.json();
        setBreweries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching breweries:', error);
        setLoading(false);
      }
    };

    fetchBreweries();
  }, []);

  const breweryTypes = ['all', ...new Set(breweries.map(b => b.brewery_type))];

  const filteredBreweries = breweries
    .filter(brewery =>
      brewery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brewery.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brewery.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(brewery => selectedType === 'all' || brewery.brewery_type === selectedType);

  const stats = {
    total: breweries.length,
    types: Object.fromEntries(
      breweryTypes
        .filter(type => type !== 'all')
        .map(type => [
          type,
          breweries.filter(b => b.brewery_type === type).length
        ])
    ),
    states: Object.entries(
      breweries.reduce((acc, brewery) => {
        acc[brewery.state] = (acc[brewery.state] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5)
  };

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="topbar">
        <div className="header-content">
          <h1 className="header-title">
            <Beer className="icon" /> Brewery Dashboard
          </h1>
          <div className="search-bar">
            <div className="search-input">
              <Search className="icon" />
              <input
                type="text"
                placeholder="Search breweries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {breweryTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-content">
        <section className="summary-grid">
          <div className="card">
            <h2>Total Breweries</h2>
            <p className="stat">{stats.total}</p>
          </div>
          <div className="card">
            <h2>Brewery Types</h2>
            <div className="stat-list">
              {Object.entries(stats.types).map(([type, count]) => (
                <div key={type} className="stat-row">
                  <span className="capitalize">{type}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2>Top States</h2>
            <div className="stat-list">
              {stats.states.map(([state, count]) => (
                <div key={state} className="stat-row">
                  <span>{state}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="brewery-list">
          {filteredBreweries.map(brewery => (
            <div key={brewery.id} className="brewery-item">
              <div className="brewery-header">
                <div>
                  <h3>{brewery.name}</h3>
                  <div className="brewery-info">
                    <span><MapPin className="icon" /> {brewery.city}, {brewery.state}</span>
                    {brewery.phone && <span><Phone className="icon" /> {brewery.phone}</span>}
                    {brewery.website_url && (
                      <a
                        href={brewery.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        <Globe className="icon" /> Website
                      </a>
                    )}
                  </div>
                </div>
                <span className="brewery-type">{brewery.brewery_type}</span>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
