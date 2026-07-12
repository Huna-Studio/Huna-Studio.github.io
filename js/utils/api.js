/* ============================================
   HUNA API / Data Utilities
   ============================================ */

// Cache for JSON data
const dataCache = new Map();

export async function fetchData(url, useCache = true) {
  if (useCache && dataCache.has(url)) {
    return dataCache.get(url);
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (useCache) {
      dataCache.set(url, data);
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

export function clearCache(url) {
  if (url) {
    dataCache.delete(url);
  } else {
    dataCache.clear();
  }
}

// Form submission (with offline support)
export async function submitForm(formData, endpoint = '/api/submit') {
  try {
    // Try online submission first
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) throw new Error('Submission failed');
    return { success: true, data: await response.json() };
    
  } catch (error) {
    // Store for background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      // Store in IndexedDB for sync
      await storeForSync(formData);
      
      await registration.sync.register('sync-forms');
      return { success: true, offline: true };
    }
    
    return { success: false, error: error.message };
  }
}

async function storeForSync(data) {
  // Simple localStorage fallback for now
  const queue = JSON.parse(localStorage.getItem('huna-form-queue') || '[]');
  queue.push({ data, timestamp: Date.now() });
  localStorage.setItem('huna-form-queue', JSON.stringify(queue));
}

// Newsletter subscription
export async function subscribeNewsletter(email) {
  // TODO: Replace with actual endpoint when backend is ready
  // return submitForm({ email, type: 'newsletter' }, '/api/newsletter');
  console.log("done");
  // Simulated for now
  await new Promise(r => setTimeout(r, 1000));
  return { success: true };
}
// export async function subscribeNewsletter(email) {
//   return submitForm({ email, type: 'newsletter' }, '/api/newsletter');
// }
