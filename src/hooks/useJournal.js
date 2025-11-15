/**
 * Journal hook for managing journal entries via API
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useJournal() {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch entries when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    } else {
      // Fall back to localStorage when not authenticated
      loadFromLocalStorage();
    }
  }, [isAuthenticated]);

  async function fetchEntries() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/journal', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Fetch entries error:', err);
      setError(err.message);
      // Fall back to localStorage on error
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }

  async function saveEntry(entry) {
    setError(null);

    if (!isAuthenticated) {
      // Save to localStorage when not authenticated
      return saveToLocalStorage(entry);
    }

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error('Failed to save journal entry');
      }

      const data = await response.json();
      
      // Refresh entries
      await fetchEntries();
      
      return { success: true, entry: data.entry };
    } catch (err) {
      console.error('Save entry error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }

  async function deleteEntry(entryId) {
    setError(null);

    if (!isAuthenticated) {
      // Delete from localStorage when not authenticated
      return deleteFromLocalStorage(entryId);
    }

    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }

      // Update local state
      setEntries(prev => prev.filter(e => e.id !== entryId));
      
      return { success: true };
    } catch (err) {
      console.error('Delete entry error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }

  // LocalStorage fallback functions
  function loadFromLocalStorage() {
    if (typeof localStorage === 'undefined') return;

    const key = 'tarot_journal';
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setEntries(parsed);
        }
      } catch (error) {
        console.error('Failed to load journal from localStorage', error);
      }
    }
  }

  function saveToLocalStorage(entry) {
    if (typeof localStorage === 'undefined') {
      return { success: false, error: 'localStorage not available' };
    }

    try {
      const key = 'tarot_journal';
      let list = [];
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      }
      list.unshift(entry);
      if (list.length > 100) {
        list.length = 100;
      }
      localStorage.setItem(key, JSON.stringify(list));
      setEntries(list);
      return { success: true };
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      return { success: false, error: error.message };
    }
  }

  function deleteFromLocalStorage(entryIndex) {
    if (typeof localStorage === 'undefined') {
      return { success: false, error: 'localStorage not available' };
    }

    try {
      const key = 'tarot_journal';
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.splice(entryIndex, 1);
          localStorage.setItem(key, JSON.stringify(list));
          setEntries(list);
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to delete from localStorage', error);
      return { success: false, error: error.message };
    }
  }

  return {
    entries,
    loading,
    error,
    saveEntry,
    deleteEntry,
    refreshEntries: isAuthenticated ? fetchEntries : loadFromLocalStorage
  };
}
