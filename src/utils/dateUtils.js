// Date utilities for PulsePath

export function parseDate(dateInput) {
  if (!dateInput && dateInput !== 0) return null;
  
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  // Firestore Timestamp object support (toDate, seconds, _seconds)
  if (typeof dateInput === 'object') {
    if (typeof dateInput.toDate === 'function') {
      try {
        const d = dateInput.toDate();
        if (d instanceof Date && !isNaN(d.getTime())) return d;
      } catch {}
    }
    if (typeof dateInput.seconds === 'number') {
      const ms = dateInput.seconds * 1000 + (dateInput.nanoseconds ? Math.floor(dateInput.nanoseconds / 1000000) : 0);
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof dateInput._seconds === 'number') {
      const ms = dateInput._seconds * 1000 + (dateInput._nanoseconds ? Math.floor(dateInput._nanoseconds / 1000000) : 0);
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Numeric epoch timestamp (seconds vs milliseconds)
  if (typeof dateInput === 'number') {
    if (isNaN(dateInput) || !isFinite(dateInput)) return null;
    const ms = dateInput < 1e11 ? dateInput * 1000 : dateInput;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // String format
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed || trimmed === 'Invalid Date' || trimmed === 'undefined' || trimmed === 'null') {
      return null;
    }
    // String of pure digits (e.g. "1728213600" or "1728213600000")
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      const ms = num < 1e11 ? num * 1000 : num;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function calculateJourneyStats(startDate) {
  if (!startDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
  
  const d = parseDate(startDate);
  const start = d ? d.getTime() : Date.now();
  const now = Date.now();
  const diff = Math.max(0, now - start);

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  const months = Math.floor(remainingDays / 30);

  return {
    totalDays: days,
    days,
    hours,
    minutes,
    seconds,
    years,
    months
  };
}

export function calculateCountdown(targetDate) {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };

  const d = parseDate(targetDate);
  const target = d ? d.getTime() : Date.now();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isPast: false };
}

export function formatRomanticDate(dateInput) {
  const date = parseDate(dateInput);
  if (!date) return '';
  try {
    const res = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    return (res && res !== 'Invalid Date') ? res : '';
  } catch {
    return '';
  }
}

export function formatTimeAgo(dateInput) {
  const date = parseDate(dateInput);
  if (!date) return 'Recently';
  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatRomanticDate(date) || 'Recently';
}

export function formatMessageTime(dateInput, fallback = '') {
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (trimmed && trimmed !== 'Invalid Date' && !trimmed.includes('NaN')) {
      if (/^\d{1,2}:\d{2}(\s*(AM|PM|am|pm))?$/i.test(trimmed)) {
        return trimmed;
      }
    }
  }
  const date = parseDate(dateInput);
  if (!date) return fallback;
  try {
    const formatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (formatted && formatted !== 'Invalid Date' && !formatted.includes('NaN')) {
      return formatted;
    }
  } catch {}
  return fallback;
}

export function formatMessageDateDivider(dateInput, fallback = 'Today') {
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (trimmed === 'Today' || trimmed === 'Yesterday') {
      return trimmed;
    }
  }
  const date = parseDate(dateInput);
  if (!date) return fallback;
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  try {
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    if (formatted && formatted !== 'Invalid Date' && !formatted.includes('NaN')) {
      return formatted;
    }
  } catch {}
  return fallback;
}

export function getMessageTimestamp(msg) {
  if (!msg) return 0;
  const raw = msg.createdAt || msg.created_at || msg.timestamp || msg.time;
  const d = parseDate(raw);
  if (d && !isNaN(d.getTime())) return d.getTime();
  if (msg.id === 'canon_msg_1_voice_014') return 1000;
  if (msg.id === 'canon_msg_2_hearts') return 2000;
  if (msg.id === 'canon_msg_3_walk_photos') return 3000;
  if (msg.id === 'canon_msg_4_voice_046') return 4000;
  if (typeof msg.id === 'string' && msg.id.startsWith('local_')) {
    const ts = parseInt(msg.id.replace('local_', ''), 10);
    if (!isNaN(ts) && ts > 0) return ts;
  }
  return 0;
}

