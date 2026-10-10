import { getCommunityInsights } from '../services/insightService.js';

export async function getInsights(req, res, next) {
  try {
    const { city, category } = req.query;
    const insights = await getCommunityInsights({ city, category });
    res.json(insights);
  } catch (error) {
    next(error);
  }
}
