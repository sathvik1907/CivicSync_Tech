import { Report } from '../models/Report.js';

export async function getCommunityInsights({ city, category }) {
  // Only consider reviewed reports (Assigned, In Progress, Resolved) or non-rejected
  const query = { status: { $ne: 'Rejected' } };
  
  if (city) {
    query['privateLocation.city'] = new RegExp(`^${city}$`, 'i');
  }

  if (category) {
    query.category = category;
  }

  const reports = await Report.find(query).select('category status publicGridCell createdAt');

  const categoryCounts = {};
  const statusCounts = {};
  const heatmapCellsMap = new Map();

  for (const r of reports) {
    // Tally category
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;

    // Tally status
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;

    // Aggregate into 250m privacy cells
    if (r.publicGridCell && r.publicGridCell.cellId) {
      const cell = r.publicGridCell;
      const existing = heatmapCellsMap.get(cell.cellId) || {
        cellId: cell.cellId,
        lat: cell.centerLat,
        lon: cell.centerLon,
        count: 0,
        categories: {}
      };
      existing.count += 1;
      existing.categories[r.category] = (existing.categories[r.category] || 0) + 1;
      heatmapCellsMap.set(cell.cellId, existing);
    }
  }

  const heatmapCells = Array.from(heatmapCellsMap.values());

  return {
    totalReports: reports.length,
    categoryCounts,
    statusCounts,
    heatmapCells
  };
}
