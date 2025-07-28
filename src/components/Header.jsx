import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileCheck2, PlusCircle, ChevronDown } from 'lucide-react';
import './Header.css';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleEventTypeSelect = (eventType) => {
    setIsDropdownOpen(false);
    navigate('/create-event', { state: { eventType } });
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        <NavLink to="/" className="logo">
          <FileCheck2 className="logo-icon" />
          <span>QMS Module</span>
        </NavLink>
        <nav className="main-nav">
          <div className="dropdown-container">
            <button 
              className="new-event-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <PlusCircle size={16} />
              New Event
              <ChevronDown size={14} />
            </button>
            {isDropdownOpen && (
              <div className="event-type-dropdown">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/create-audit');
                    setIsDropdownOpen(false);
                  }}
                >
                  Audit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/create-deviation');
                    setIsDropdownOpen(false);
                  }}
                >
                  Deviation
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/create-change-control');
                    setIsDropdownOpen(false);
                  }}
                >
                  Change Control
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/create-capa');
                    setIsDropdownOpen(false);
                  }}
                >
                  CAPA
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
