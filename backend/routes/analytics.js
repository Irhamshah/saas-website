import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/analytics/track
// @desc    Track tool usage
// @access  Private
router.post('/track', protect, async (req, res) => {
  try {
    const { toolId } = req.body;
    
    if (!toolId) {
      return res.status(400).json({ message: 'Tool ID is required' });
    }

    const user = await User.findById(req.user._id);
    
    // Track monthly usage
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    if (!user.monthlyUsage) {
      user.monthlyUsage = {};
    }
    
    const monthKey = `${currentYear}-${currentMonth}`;
    if (!user.monthlyUsage[monthKey]) {
      user.monthlyUsage[monthKey] = {};
    }
    
    if (!user.monthlyUsage[monthKey][toolId]) {
      user.monthlyUsage[monthKey][toolId] = 0;
    }
    
    user.monthlyUsage[monthKey][toolId] += 1;
    user.markModified('monthlyUsage');
    
    // Also track in overall usage
    await user.trackToolUsage(toolId);

    res.json({ 
      message: 'Usage tracked successfully',
      count: user.monthlyUsage[monthKey][toolId]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/usage/:toolId
// @desc    Get usage count for specific tool this month
// @access  Private
router.get('/usage/:toolId', protect, async (req, res) => {
  try {
    const { toolId } = req.params;
    const user = await User.findById(req.user._id);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const count = user.monthlyUsage?.[monthKey]?.[toolId] || 0;
    
    res.json({ 
      toolId,
      count,
      limit: user.isPremium ? null : 3,
      remaining: user.isPremium ? null : Math.max(0, 3 - count)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/stats
// @desc    Get user usage statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Calculate stats
    const totalUsage = user.totalToolUsage;
    const uniqueTools = user.toolsUsed.length;
    const mostUsedTool = user.toolsUsed.reduce((prev, current) => {
      return (current.count > prev.count) ? current : prev;
    }, { count: 0, toolId: null });

    // Days active
    const daysActive = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Monthly usage
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    const monthlyUsage = user.monthlyUsage?.[monthKey] || {};
    const monthlyTotal = Object.values(monthlyUsage).reduce((sum, count) => sum + count, 0);

    res.json({
      totalUsage,
      uniqueTools,
      mostUsedTool: {
        toolId: mostUsedTool.toolId,
        count: mostUsedTool.count
      },
      daysActive,
      monthlyUsage: monthlyTotal,
      toolsUsed: user.toolsUsed,
      isPremium: user.isPremium,
      usageLimit: user.isPremium ? null : 3
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/monthly
// @desc    Get current month's detailed usage
// @access  Private
router.get('/monthly', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const monthlyUsage = user.monthlyUsage?.[monthKey] || {};
    const totalThisMonth = Object.values(monthlyUsage).reduce((sum, count) => sum + count, 0);
    
    // Format for response
    const toolUsage = Object.entries(monthlyUsage).map(([toolId, count]) => ({
      toolId,
      count,
      limit: user.isPremium ? null : 3,
      remaining: user.isPremium ? null : Math.max(0, 3 - count)
    }));

    res.json({
      month: currentMonth + 1,
      year: currentYear,
      totalUsage: totalThisMonth,
      isPremium: user.isPremium,
      tools: toolUsage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/admin/overview
// @desc    Get platform overview stats (admin only)
// @access  Private (admin)
router.get('/admin/overview', protect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Aggregate total tool usage
    const usageAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$totalToolUsage' }
        }
      }
    ]);

    const totalToolUsage = usageAgg.length > 0 ? usageAgg[0].totalUsage : 0;

    // Calculate revenue estimate
    const monthlyRevenue = premiumUsers * 4.99;
    const annualRevenue = monthlyRevenue * 12;

    res.json({
      totalUsers,
      premiumUsers,
      activeUsers,
      totalToolUsage,
      conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0,
      revenue: {
        monthly: monthlyRevenue.toFixed(2),
        annual: annualRevenue.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
