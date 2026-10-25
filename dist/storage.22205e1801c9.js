/** One versioned snapshot per transaction keeps document and selection changes atomic. */
export function createStorage(){let db;return {
 async open(){db=await new Promise((resolve,reject)=>{const req=indexedDB.open('flow-reader',1);req.onupgradeneeded=()=>req.result.createObjectStore('library');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Close other Flow tabs and try again.'));});db.onversionchange=()=>db.close();},
 async read(){return new Promise((resolve,reject)=>{const tx=db.transaction('library','readonly');const req=tx.objectStore('library').get('state');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});},
 async write(snapshot){return new Promise((resolve,reject)=>{const tx=db.transaction('library','readwrite');tx.objectStore('library').put(snapshot,'state');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save interrupted.'));});}
};}
