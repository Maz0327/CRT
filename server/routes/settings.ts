import type { Express } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  extensionSettings: z.object({
    keyboardShortcut: z.string().optional(),
    enableShortcut: z.boolean().optional(),
    autoTag: z.boolean().optional(),
    showOverlayHints: z.boolean().optional(),
    autoSummarize: z.boolean().optional(),
    addToProject: z.boolean().optional(),
  }).optional(),
  dashboardSettings: z.object({
    defaultView: z.string().optional(),
    metricsVisible: z.array(z.string()).optional(),
    chartPreferences: z.record(z.any()).optional(),
    layoutConfiguration: z.record(z.any()).optional(),
  }).optional(),
  searchSettings: z.object({
    savedSearches: z.array(z.object({
      name: z.string(),
      query: z.string(),
      filters: z.record(z.any()),
    })).optional(),
    defaultFilters: z.record(z.any()).optional(),
    resultsPerPage: z.number().optional(),
  }).optional(),
});

export function setupSettingsRoutes(app: Express) {
  // Get user settings
  app.get('/api/settings', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      let settings = await storage.getUserSettings(req.session.user.id);
      
      // Create default settings if they don't exist
      if (!settings) {
        settings = await storage.createUserSettings({
          userId: req.session.user.id,
          extensionSettings: {
            keyboardShortcut: 'Ctrl+Shift+S',
            enableShortcut: true,
            autoTag: true,
            showOverlayHints: true,
            autoSummarize: true,
            addToProject: true,
          },
          dashboardSettings: {
            defaultView: 'briefing',
            metricsVisible: ['captures', 'viral', 'trends'],
            chartPreferences: {},
            layoutConfiguration: {},
          },
          searchSettings: {
            savedSearches: [],
            defaultFilters: {},
            resultsPerPage: 20,
          },
        });
      }

      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Update user settings
  app.put('/api/settings', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = updateSettingsSchema.parse(req.body);
      
      // Check if settings exist
      let settings = await storage.getUserSettings(req.session.user.id);
      
      if (settings) {
        // Update existing settings
        settings = await storage.updateUserSettings(req.session.user.id, validatedData);
      } else {
        // Create new settings
        settings = await storage.createUserSettings({
          userId: req.session.user.id,
          ...validatedData,
        });
      }

      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid settings data', details: error.errors });
      }
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // Update specific setting category
  app.patch('/api/settings/:category', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { category } = req.params;
      if (!['extension', 'dashboard', 'search'].includes(category)) {
        return res.status(400).json({ error: 'Invalid settings category' });
      }

      const updateData: any = {};
      if (category === 'extension') updateData.extensionSettings = req.body;
      if (category === 'dashboard') updateData.dashboardSettings = req.body;
      if (category === 'search') updateData.searchSettings = req.body;

      const settings = await storage.updateUserSettings(req.session.user.id, updateData);
      res.json(settings);
    } catch (error) {
      console.error('Error updating settings category:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });
}