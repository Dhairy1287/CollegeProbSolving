/**
 * storage-utils.js
 * Abstraction over localStorage for storing and retrieving ragging reports.
 * Reports are stored as JSON objects; reporter identity is already encrypted
 * before this layer is reached.
 */

const STORAGE_KEY = 'rrs_reports_v1';

/**
 * Saves a new report to localStorage.
 * @param {Object} report
 */
function saveReport(report) {
    const existing = getAllReports();
    existing.push(report);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/**
 * Retrieves all reports from localStorage.
 * @returns {Array<Object>}
 */
function getAllReports() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Clears all reports — admin operation only.
 */
function clearReports() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Returns the count of stored reports.
 * @returns {number}
 */
function getReportCount() {
    return getAllReports().length;
}

/**
 * Gets a single report by ID.
 * @param {string} id
 * @returns {Object|null}
 */
function getReportById(id) {
    return getAllReports().find(r => r.id === id) || null;
}
