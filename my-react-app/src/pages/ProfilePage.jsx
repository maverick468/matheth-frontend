// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await apiClient.get('/auth/profile');
        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch user profile data.');
        }

        setProfile(data.user);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'An error occurred while loading your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle Profile Picture File Selection & Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Validate file type and size (e.g., max 2MB)
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Send to your backend profile update endpoint
      const response = await apiClient.patch('/auth/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update local profile state with the new avatar URL returned from the server
        setProfile((prev) => ({
          ...prev,
          profilePicUrl: response.data.profilePicUrl || URL.createObjectURL(file)
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile picture.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-slate-400">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading player profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/60 p-6 rounded-2xl text-center text-red-300">
          <p className="text-sm font-semibold mb-2">Could not load profile</p>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  // Extract fields & fallbacks
  const displayEmail = profile?.email || 'player@matheth.app';
  // Fallback username to the text before '@' if username/name isn't defined
  const emailUsername = displayEmail.split('@')[0];
  const displayName = profile?.name || profile?.username || emailUsername;
  
  const gamesPlayed = profile?.gamesPlayed ?? profile?.stats?.gamesPlayed ?? 0;
  const totalLevels = profile?.totalLevels ?? profile?.stats?.totalLevels ?? 0;
  const userInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.profilePicUrl || profile?.avatar;

  return (
    <div className="flex flex-col items-center flex-grow p-6 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        
        {/* Profile Picture / Avatar Section with Upload Trigger */}
        <div className="relative w-24 h-24 mx-group mx-auto group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500 to-teal-400 rounded-full mx-auto flex items-center justify-center text-slate-950 text-3xl font-black shadow-lg shadow-cyan-500/20 overflow-hidden border-2 border-cyan-400/40">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs font-bold text-cyan-300">
              {uploading ? 'Uploading...' : 'Change Photo'}
            </span>
          </div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-1">@{displayName}</h2>
          <p className="text-slate-400 text-sm">{displayEmail}</p>
        </div>

        {/* Stats Grid: Games Played & Total Levels */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
            <span className="text-2xl font-black text-cyan-400">{gamesPlayed}</span>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Games Played</p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
            <span className="text-2xl font-black text-cyan-400">{totalLevels}</span>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Total Levels</p>
          </div>
        </div>

      </div>
    </div>
  );
}