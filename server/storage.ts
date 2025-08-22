// Final Working Storage Implementation - Using DATABASE_URL
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from "uuid";
import type { 
  User, Project, Capture, ContentRadar, Brief,
  InsertUser, InsertProject, InsertCapture, InsertBrief, InsertContentRadar,
  ClientProfile, InsertClientProfile,
  DsdBrief, InsertDsdBrief,
  CollectivePattern, InsertCollectivePattern,
  CulturalMoment, InsertCulturalMoment,
  HypothesisValidation, InsertHypothesisValidation,
  UserSettings, InsertUserSettings,
  Annotation, InsertAnnotation,
  AnalyticsData, InsertAnalyticsData
} from "@shared/supabase-schema";

export interface IStorage {
  // Health check for monitoring
  healthCheck(): Promise<{ status: string; timestamp: string }>;

  // User Management
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  
  // Project Management
  getProjects(userId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Capture Management
  getCaptures(projectId: string): Promise<Capture[]>;
  getUserCaptures(userId: string): Promise<Capture[]>;
  getCaptureById(id: string): Promise<Capture | undefined>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture>;
  deleteCapture(id: string): Promise<void>;
  
  // Content Radar Management
  getContentItems(filter: { 
    category?: string; 
    platform?: string; 
    timeRange?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<ContentRadar[]>;
  getContentItemById(id: string): Promise<ContentRadar | undefined>;
  createContentItem(item: InsertContentRadar): Promise<ContentRadar>;
  updateContentItem(id: string, updates: Partial<InsertContentRadar>): Promise<ContentRadar>;
  deleteContentItem(id: string): Promise<void>;
  
  // Brief Management
  getBriefs(projectId: string): Promise<Brief[]>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  
  // Stats and Analytics
  getStats(): Promise<any>;
  getRecentScans(limit?: number): Promise<any[]>;
  
  // Legacy support
  getAllSources(): Promise<any[]>;
  getSignals(filter: any): Promise<any[]>;
  
  // Strategic Intelligence Features
  
  // Client Profile Management
  getClientProfiles(userId: string): Promise<ClientProfile[]>;
  getClientProfileById(id: string): Promise<ClientProfile | undefined>;
  createClientProfile(profile: InsertClientProfile): Promise<ClientProfile>;
  updateClientProfile(id: string, updates: Partial<InsertClientProfile>): Promise<ClientProfile>;
  deleteClientProfile(id: string): Promise<void>;
  
  // DSD Brief Management
  getDsdBriefs(projectId: string): Promise<DsdBrief[]>;
  getDsdBriefById(id: string): Promise<DsdBrief | undefined>;
  createDsdBrief(brief: InsertDsdBrief): Promise<DsdBrief>;
  updateDsdBrief(id: string, updates: Partial<InsertDsdBrief>): Promise<DsdBrief>;
  deleteDsdBrief(id: string): Promise<void>;
  
  // Collective Intelligence
  getCollectivePatterns(filter?: { patternType?: string; minConfidence?: number }): Promise<CollectivePattern[]>;
  createCollectivePattern(pattern: InsertCollectivePattern): Promise<CollectivePattern>;
  updateCollectivePattern(id: string, updates: Partial<InsertCollectivePattern>): Promise<CollectivePattern>;
  
  // Cultural Moments
  getCulturalMoments(filter?: { status?: string; limit?: number }): Promise<CulturalMoment[]>;
  createCulturalMoment(moment: InsertCulturalMoment): Promise<CulturalMoment>;
  updateCulturalMoment(id: string, updates: Partial<InsertCulturalMoment>): Promise<CulturalMoment>;
  
  // Hypothesis Tracking
  getHypothesisValidations(captureId?: string): Promise<HypothesisValidation[]>;
  createHypothesisValidation(validation: InsertHypothesisValidation): Promise<HypothesisValidation>;
  updateHypothesisValidation(id: string, updates: Partial<InsertHypothesisValidation>): Promise<HypothesisValidation>;
  
  // User Settings Management
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, updates: Partial<InsertUserSettings>): Promise<UserSettings>;
  
  // Annotations Management
  getAnnotations(captureId: string): Promise<Annotation[]>;
  getAnnotationById(id: string): Promise<Annotation | undefined>;
  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  updateAnnotation(id: string, updates: Partial<InsertAnnotation>): Promise<Annotation>;
  deleteAnnotation(id: string): Promise<void>;
  
  // Extension Management
  createPairingCode(data: { code: string; userId: string; projectId?: string | null; deviceLabel?: string | null; expiresAt: Date }): Promise<void>;
  validatePairingCode(code: string): Promise<{ user_id: string; project_id?: string | null; device_label?: string | null } | null>;
  markPairingCodeUsed(code: string, deviceId: string): Promise<void>;
  createExtensionDevice(data: { userId: string; projectId?: string | null; label?: string | null; lastSeenAt: Date }): Promise<{ id: string }>;
  getExtensionDevice(deviceId: string): Promise<{ user_id: string; revoked_at?: Date | null } | null>;
  listExtensionDevices(userId: string): Promise<any[]>;
  updateDeviceHeartbeat(deviceId: string): Promise<void>;
  updateDeviceLabel(deviceId: string, label: string): Promise<void>;
  revokeDevice(deviceId: string): Promise<void>;
  
  // Analytics Data Management
  getAnalyticsData(filter: {
    userId?: string;
    projectId?: string;
    metricType?: string;
    timeframe?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AnalyticsData[]>;
  createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData>;
  getDashboardMetrics(userId: string): Promise<any>;
  
  // Search and Filtering
  searchCaptures(query: string, filters?: any): Promise<Capture[]>;
  
  // Enhanced captures list with analysis data (Task Block #6)
  listCapturesWithAnalysis(params: {
    userId: string;
    projectId?: string;
    platform?: string;
    q?: string;
    tags?: string[];
    label?: string;
    analyzed?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    pageSize: number;
  }): Promise<{ 
    rows: any[], 
    total: number, 
    lastModified?: Date 
  }>;
  
  getCaptureWithAnalysis(id: string): Promise<any | undefined>;
  getPendingCaptures(): Promise<Capture[]>;
  
  // Job Management
  createJob(input: { type: string; payload: any; userId?: string }): Promise<any>;
  getJobById(id: string): Promise<any | null>;
  takeNextQueuedJob(): Promise<any | null>;
  completeJob(id: string, result: any): Promise<void>;
  failJob(id: string, error: string): Promise<void>;
  retryJob(id: string, error: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private client: Client;

  // Health check for monitoring
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const result = await this.client.query('SELECT 1 as test');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Database health check failed: ${error}`);
    }
  }

  constructor() {
    // Use DATABASE_URL directly for Neon/Supabase connection
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    this.client.connect().then(() => {
      console.log("✅ Connected using DATABASE_URL");
      console.log(`📊 Media Analysis Provider: ${process.env.MEDIA_PROVIDER || 'not set'}`);
      console.log(`🔧 Background Workers: ${process.env.ENABLE_WORKERS || 'false'}`);
      console.log(`📦 Storage Bucket: ${process.env.SUPABASE_STORAGE_BUCKET || 'not set'}`);
      console.log(`🏷️  Auto-tag Analysis: ${process.env.AUTO_TAG_FROM_ANALYSIS || 'false'}`);
      console.log(`📏 Sync File Limit: ${process.env.ANALYSIS_MAX_SYNC_IMAGE_BYTES || '5MB'} bytes`);
      
      // Test with a simple user creation and retrieval
      this.initializeTestUser();
    }).catch(err => {
      console.error("❌ DATABASE_URL connection failed:", err);
    });
  }

  private async initializeTestUser() {
    try {
      // Check if test user already exists
      const existing = await this.client.query(
        'SELECT id FROM users WHERE email = $1',
        ['test@example.com']
      );
      
      if (existing.rows.length === 0) {
        // Create a working test user
        // Generate a fresh hash for 'test123'
        const passwordHash = await bcrypt.hash('test123', 10);
        
        await this.client.query(`
          INSERT INTO users (id, email, username, password, role, onboarding_completed, tour_completed, progress_data, google_tokens, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `, [
          'test@example.com',
          'testuser',
          passwordHash, // Fresh hash for "test123"
          'user',
          false,
          false,
          JSON.stringify({}),
          JSON.stringify({})
        ]);
        
        console.log("✅ Created test user: test@example.com / test123");
      } else {
        console.log("✅ Test user already exists: test@example.com / test123");
      }
    } catch (error) {
      console.error("❌ Error initializing test user:", error);
    }
  }

  // Row mapping helper methods
  private mapCaptureRow(row: any): Capture {
    return {
      id: row.id,
      projectId: row.project_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      url: row.url,
      platform: row.platform,
      screenshotUrl: row.screenshot_url,
      summary: row.summary,
      tags: row.tags || [],
      metadata: row.metadata,
      truthAnalysis: row.truth_analysis,
      analysisStatus: row.analysis_status,
      googleAnalysis: row.google_analysis,
      dsdTags: row.dsd_tags,
      dsdSection: row.dsd_section,
      viralScore: row.viral_score,
      culturalResonance: row.cultural_resonance,
      prediction: row.prediction,
      outcome: row.outcome,
      workspaceNotes: row.workspace_notes,
      briefSectionAssignment: row.brief_section_assignment,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as Capture;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        
        return {
          id: row.id,
          email: row.email,
          username: row.username,
          password: row.password,
          role: row.role,
          onboardingCompleted: row.onboarding_completed,
          tourCompleted: row.tour_completed,
          progressData: row.progress_data,
          googleTokens: row.google_tokens,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as User;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Database error:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM users WHERE username = $1 LIMIT 1',
        [username]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          email: row.email,
          username: row.username,
          password: row.password,
          role: row.role,
          onboardingCompleted: row.onboarding_completed,
          tourCompleted: row.tour_completed,
          progressData: row.progress_data,
          googleTokens: row.google_tokens,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as User;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching user by username:", error);
      return undefined;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          email: row.email,
          username: row.username,
          password: row.password,
          role: row.role,
          onboardingCompleted: row.onboarding_completed,
          tourCompleted: row.tour_completed,
          progressData: row.progress_data,
          googleTokens: row.google_tokens,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as User;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching user by id:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Defensive password hashing - ensure password is always hashed
      const bcrypt = await import('bcryptjs');
      const hashedPassword = insertUser.password.startsWith('$2') 
        ? insertUser.password 
        : await bcrypt.hash(insertUser.password, 10);

      const result = await this.client.query(`
        INSERT INTO users (id, email, username, password, role, onboarding_completed, tour_completed, progress_data, google_tokens, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        insertUser.email,
        insertUser.username,
        hashedPassword,
        insertUser.role || 'user',
        insertUser.onboardingCompleted || false,
        insertUser.tourCompleted || false,
        JSON.stringify(insertUser.progressData || {}),
        JSON.stringify(insertUser.googleTokens || {})
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        username: row.username,
        password: row.password,
        role: row.role,
        onboardingCompleted: row.onboarding_completed,
        tourCompleted: row.tour_completed,
        progressData: row.progress_data,
        googleTokens: row.google_tokens,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as User;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic SET clause
      if (updates.email) {
        setClause.push(`email = $${paramCount++}`);
        values.push(updates.email);
      }
      if (updates.username) {
        setClause.push(`username = $${paramCount++}`);
        values.push(updates.username);
      }
      if (updates.googleTokens !== undefined) {
        setClause.push(`google_tokens = $${paramCount++}`);
        values.push(JSON.stringify(updates.googleTokens));
      }
      if (updates.progressData !== undefined) {
        setClause.push(`progress_data = $${paramCount++}`);
        values.push(JSON.stringify(updates.progressData));
      }
      if (updates.onboardingCompleted !== undefined) {
        setClause.push(`onboarding_completed = $${paramCount++}`);
        values.push(updates.onboardingCompleted);
      }
      if (updates.tourCompleted !== undefined) {
        setClause.push(`tour_completed = $${paramCount++}`);
        values.push(updates.tourCompleted);
      }
      if (updates.role) {
        setClause.push(`role = $${paramCount++}`);
        values.push(updates.role);
      }

      if (setClause.length === 0) {
        throw new Error('No valid fields to update');
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(`
        UPDATE users 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        username: row.username,
        password: row.password,
        role: row.role,
        onboardingCompleted: row.onboarding_completed,
        tourCompleted: row.tour_completed,
        progressData: row.progress_data,
        googleTokens: row.google_tokens,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as User;
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  }

  // Project Management
  async getProjects(userId: string): Promise<Project[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        briefTemplate: row.brief_template,
        status: row.status,
        client: row.client,
        deadline: row.deadline,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Project));
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      return [];
    }
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM projects WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          description: row.description,
          briefTemplate: row.brief_template,
          status: row.status,
          client: row.client,
          deadline: row.deadline,
          tags: row.tags,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as Project;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching project:", error);
      return undefined;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const result = await this.client.query(`
        INSERT INTO projects (id, user_id, name, description, brief_template, status, client, deadline, tags, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        project.userId,
        project.name,
        project.description || null,
        project.briefTemplate || 'jimmy-johns',
        project.status || 'active',
        project.client || null,
        project.deadline || null,
        JSON.stringify(project.tags || [])
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        briefTemplate: row.brief_template,
        status: row.status,
        client: row.client,
        deadline: row.deadline,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Project;
    } catch (error) {
      console.error("❌ Error creating project:", error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.briefTemplate !== undefined) {
        fields.push(`brief_template = $${paramCount++}`);
        values.push(updates.briefTemplate);
      }
      if (updates.status !== undefined) {
        fields.push(`status = $${paramCount++}`);
        values.push(updates.status);
      }
      if (updates.client !== undefined) {
        fields.push(`client = $${paramCount++}`);
        values.push(updates.client);
      }
      if (updates.deadline !== undefined) {
        fields.push(`deadline = $${paramCount++}`);
        values.push(updates.deadline);
      }
      if (updates.tags !== undefined) {
        fields.push(`tags = $${paramCount++}`);
        values.push(JSON.stringify(updates.tags));
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        briefTemplate: row.brief_template,
        status: row.status,
        client: row.client,
        deadline: row.deadline,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Project;
    } catch (error) {
      console.error("❌ Error updating project:", error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM projects WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      throw error;
    }
  }

  // Additional methods for new API routes
  async listProjects(userId: string): Promise<Project[]> {
    return this.getProjects(userId);
  }

  async listCaptures(userId: string, options?: { project_id?: string }): Promise<Capture[]> {
    try {
      let query = 'SELECT * FROM captures WHERE user_id = $1';
      let params = [userId];
      
      if (options?.project_id) {
        query += ' AND project_id = $2';
        params.push(options.project_id);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await this.client.query(query, params);
      return result.rows.map(row => this.mapCaptureRow(row));
    } catch (error) {
      console.error("❌ Error listing captures:", error);
      return [];
    }
  }



  async listMoments(): Promise<any[]> {
    try {
      const result = await this.client.query('SELECT * FROM cultural_moments ORDER BY created_at DESC');
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        intensity: row.intensity,
        tags: row.tags || [],
        platforms: row.platforms || [],
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error("❌ Error listing moments:", error);
      return [];
    }
  }

  async updateMoment(id: string, data: Partial<any>): Promise<any | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.tags !== undefined) {
        setClause.push(`tags = $${paramCount++}`);
        values.push(data.tags);
      }

      if (setClause.length === 0) return null;

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(`
        UPDATE cultural_moments 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);

      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        intensity: row.intensity,
        tags: row.tags || [],
        platforms: row.platforms || [],
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error updating moment:", error);
      return null;
    }
  }

  async listBriefs(userId: string): Promise<any[]> {
    try {
      const result = await this.client.query('SELECT * FROM dsd_briefs WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        slides: row.slides || [],
        tags: row.tags || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error("❌ Error listing briefs:", error);
      return [];
    }
  }

  async getBrief(id: string): Promise<any | null> {
    try {
      const result = await this.client.query('SELECT * FROM dsd_briefs WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        slides: row.slides || [],
        tags: row.tags || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error getting brief:", error);
      return null;
    }
  }

  async updateBrief(id: string, data: Partial<any>): Promise<any | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.title !== undefined) {
        setClause.push(`title = $${paramCount++}`);
        values.push(data.title);
      }
      if (data.status !== undefined) {
        setClause.push(`status = $${paramCount++}`);
        values.push(data.status);
      }
      if (data.tags !== undefined) {
        setClause.push(`tags = $${paramCount++}`);
        values.push(data.tags);
      }
      if (data.slides !== undefined) {
        setClause.push(`slides = $${paramCount++}`);
        values.push(JSON.stringify(data.slides));
      }

      if (setClause.length === 0) return null;

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(`
        UPDATE dsd_briefs 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);

      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        slides: row.slides || [],
        tags: row.tags || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error updating brief:", error);
      return null;
    }
  }

  async listUserFeeds(userId: string, options?: { project_id?: string }): Promise<any[]> {
    try {
      let query = 'SELECT * FROM user_feeds WHERE user_id = $1';
      let params = [userId];
      
      if (options?.project_id) {
        query += ' AND project_id = $2';
        params.push(options.project_id);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await this.client.query(query, params);
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        feed_url: row.feed_url,
        title: row.title,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error("❌ Error listing user feeds:", error);
      return [];
    }
  }

  async getUserFeed(id: string): Promise<any | null> {
    try {
      const result = await this.client.query('SELECT * FROM user_feeds WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        feed_url: row.feed_url,
        title: row.title,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error getting user feed:", error);
      return null;
    }
  }

  async createUserFeed(data: any): Promise<any> {
    try {
      const result = await this.client.query(`
        INSERT INTO user_feeds (id, user_id, project_id, feed_url, title, is_active, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `, [data.user_id, data.project_id, data.feed_url, data.title, data.is_active]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        feed_url: row.feed_url,
        title: row.title,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error creating user feed:", error);
      throw error;
    }
  }

  async updateUserFeed(id: string, data: Partial<any>): Promise<any | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.is_active !== undefined) {
        setClause.push(`is_active = $${paramCount++}`);
        values.push(data.is_active);
      }

      if (setClause.length === 0) return null;

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(`
        UPDATE user_feeds 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);

      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        feed_url: row.feed_url,
        title: row.title,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error updating user feed:", error);
      return null;
    }
  }

  async deleteUserFeed(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM user_feeds WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting user feed:", error);
      throw error;
    }
  }

  // Enhanced storage methods for new API routes

  async listCapturesWithPagination(params: {
    userId: string;
    projectId?: string;
    platform?: string;
    q?: string;
    tags?: string[];
    page: number;
    pageSize: number;
  }): Promise<{ rows: any[], total: number }> {
    try {
      let query = 'SELECT * FROM captures WHERE user_id = $1';
      let countQuery = 'SELECT COUNT(*) FROM captures WHERE user_id = $1';
      const values: any[] = [params.userId];
      let paramCount = 1;

      if (params.projectId) {
        query += ` AND project_id = $${++paramCount}`;
        countQuery += ` AND project_id = $${paramCount}`;
        values.push(params.projectId);
      }

      if (params.platform) {
        query += ` AND platform = $${++paramCount}`;
        countQuery += ` AND platform = $${paramCount}`;
        values.push(params.platform);
      }

      if (params.q) {
        query += ` AND (title ILIKE $${++paramCount} OR content ILIKE $${paramCount})`;
        countQuery += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
        values.push(`%${params.q}%`);
      }

      if (params.tags && params.tags.length > 0) {
        query += ` AND tags @> $${++paramCount}`;
        countQuery += ` AND tags @> $${paramCount}`;
        values.push(params.tags);
      }

      // Get total count
      const countResult = await this.client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination
      query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(params.pageSize, (params.page - 1) * params.pageSize);

      const result = await this.client.query(query, values);
      const rows = result.rows.map(row => this.mapCaptureRow(row));

      return { rows, total };
    } catch (error) {
      console.error("❌ Error in listCapturesWithPagination:", error);
      return { rows: [], total: 0 };
    }
  }

  // Task Block #6: Enhanced captures list with analysis data
  async listCapturesWithAnalysis(params: {
    userId: string;
    projectId?: string;
    platform?: string;
    q?: string;
    tags?: string[];
    label?: string;
    analyzed?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    pageSize: number;
  }): Promise<{ rows: any[], total: number, lastModified?: Date }> {
    try {
      // Base query with LEFT JOIN to capture_latest_analysis view
      let baseQuery = `
        SELECT DISTINCT
          c.id, c.project_id, c.user_id, c.title, c.content, c.url, c.platform,
          c.image_url, c.image_thumb_url, c.tags, c.note, c.ai_analysis,
          c.analysis_status, c.dsd_tags, c.dsd_section, c.created_at,
          cla.analysis_id, cla.provider, cla.mode, cla.status as analysis_status_latest,
          cla.summary as analysis_summary, cla.labels as analysis_labels, 
          cla.analyzed_at,
          GREATEST(c.created_at, cla.analyzed_at) as last_modified
        FROM captures c
        LEFT JOIN capture_latest_analysis cla ON c.id = cla.capture_id
        WHERE c.user_id = $1
      `;
      
      let countQuery = `
        SELECT COUNT(DISTINCT c.id)
        FROM captures c
        LEFT JOIN capture_latest_analysis cla ON c.id = cla.capture_id
        WHERE c.user_id = $1
      `;

      const values: any[] = [params.userId];
      let paramCount = 1;

      // Apply filters
      if (params.projectId) {
        baseQuery += ` AND c.project_id = $${++paramCount}`;
        countQuery += ` AND c.project_id = $${paramCount}`;
        values.push(params.projectId);
      }

      if (params.platform) {
        baseQuery += ` AND c.platform = $${++paramCount}`;
        countQuery += ` AND c.platform = $${paramCount}`;
        values.push(params.platform);
      }

      if (params.q) {
        baseQuery += ` AND (c.title ILIKE $${++paramCount} OR c.content ILIKE $${paramCount} OR c.tags::text ILIKE $${paramCount})`;
        countQuery += ` AND (c.title ILIKE $${paramCount} OR c.content ILIKE $${paramCount} OR c.tags::text ILIKE $${paramCount})`;
        values.push(`%${params.q}%`);
      }

      if (params.tags && params.tags.length > 0) {
        baseQuery += ` AND c.tags @> $${++paramCount}`;
        countQuery += ` AND c.tags @> $${paramCount}`;
        values.push(JSON.stringify(params.tags));
      }

      if (params.label) {
        baseQuery += ` AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(cla.labels) l
          WHERE lower(coalesce(l->>'name','')) = lower($${++paramCount})
        )`;
        countQuery += ` AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(cla.labels) l  
          WHERE lower(coalesce(l->>'name','')) = lower($${paramCount})
        )`;
        values.push(params.label);
      }

      if (params.analyzed !== undefined) {
        if (params.analyzed) {
          baseQuery += ` AND cla.analysis_id IS NOT NULL`;
          countQuery += ` AND cla.analysis_id IS NOT NULL`;
        } else {
          baseQuery += ` AND cla.analysis_id IS NULL`;
          countQuery += ` AND cla.analysis_id IS NULL`;
        }
      }

      if (params.dateFrom) {
        baseQuery += ` AND c.created_at >= $${++paramCount}`;
        countQuery += ` AND c.created_at >= $${paramCount}`;
        values.push(params.dateFrom);
      }

      if (params.dateTo) {
        baseQuery += ` AND c.created_at <= $${++paramCount}`;
        countQuery += ` AND c.created_at <= $${paramCount}`;
        values.push(params.dateTo);
      }

      // Get total count
      const countResult = await this.client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add ordering and pagination  
      baseQuery += ` ORDER BY c.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(params.pageSize, (params.page - 1) * params.pageSize);

      const result = await this.client.query(baseQuery, values);

      // Calculate lastModified across the page
      let lastModified: Date | undefined;
      if (result.rows.length > 0) {
        const maxLastModified = Math.max(
          ...result.rows.map(row => new Date(row.last_modified || row.created_at).getTime())
        );
        lastModified = new Date(maxLastModified);
      }

      // Map rows with enriched analysis data
      const rows = result.rows.map(row => ({
        id: row.id,
        project_id: row.project_id,
        user_id: row.user_id,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshot_url: row.image_url,
        summary: row.note || '',
        tags: row.tags || [],
        metadata: row.ai_analysis || {},
        status: row.analysis_status || 'pending',
        created_at: row.created_at,
        updated_at: row.created_at,
        latest_analysis: row.analysis_id ? {
          status: row.analysis_status_latest,
          summary: row.analysis_summary,
          labels: row.analysis_labels || [],
          analyzed_at: row.analyzed_at,
          provider: row.provider,
          mode: row.mode
        } : null
      }));

      return { rows, total, lastModified };
    } catch (error) {
      console.error("❌ Error in listCapturesWithAnalysis:", error);
      return { rows: [], total: 0 };
    }
  }

  async updateCaptureTags(params: {
    id: string;
    userId: string;
    add: string[];
    remove: string[];
  }): Promise<any> {
    try {
      // First get current tags
      const current = await this.client.query(
        'SELECT tags FROM captures WHERE id = $1 AND user_id = $2',
        [params.id, params.userId]
      );

      if (current.rows.length === 0) {
        throw new Error('Capture not found');
      }

      let currentTags: string[] = current.rows[0].tags || [];
      
      // Remove tags
      if (params.remove.length > 0) {
        currentTags = currentTags.filter(tag => !params.remove.includes(tag));
      }

      // Add new tags (avoid duplicates)
      if (params.add.length > 0) {
        const newTags = params.add.filter(tag => !currentTags.includes(tag));
        currentTags = [...currentTags, ...newTags];
      }

      // Update
      const result = await this.client.query(
        'UPDATE captures SET tags = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
        [currentTags, params.id, params.userId]
      );

      return result.rows.length > 0 ? this.mapCaptureRow(result.rows[0]) : null;
    } catch (error) {
      console.error("❌ Error updating capture tags:", error);
      throw error;
    }
  }

  async listBriefsWithPagination(params: {
    userId: string;
    projectId?: string;
    q?: string;
    tags?: string[];
    page: number;
    pageSize: number;
  }): Promise<{ rows: any[], total: number }> {
    try {
      let query = 'SELECT * FROM dsd_briefs WHERE user_id = $1';
      let countQuery = 'SELECT COUNT(*) FROM dsd_briefs WHERE user_id = $1';
      const values: any[] = [params.userId];
      let paramCount = 1;

      if (params.projectId) {
        query += ` AND client_profile_id = $${++paramCount}`;
        countQuery += ` AND client_profile_id = $${paramCount}`;
        values.push(params.projectId);
      }

      if (params.q) {
        query += ` AND title ILIKE $${++paramCount}`;
        countQuery += ` AND title ILIKE $${paramCount}`;
        values.push(`%${params.q}%`);
      }

      if (params.tags && params.tags.length > 0) {
        query += ` AND tags @> $${++paramCount}`;
        countQuery += ` AND tags @> $${paramCount}`;
        values.push(params.tags);
      }

      // Get total count
      const countResult = await this.client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination
      query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(params.pageSize, (params.page - 1) * params.pageSize);

      const result = await this.client.query(query, values);
      const rows = result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        tags: row.tags || [],
        slides: row.slides || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      return { rows, total };
    } catch (error) {
      console.error("❌ Error in listBriefsWithPagination:", error);
      return { rows: [], total: 0 };
    }
  }

  async getBriefWithDetails(params: { id: string; userId: string }): Promise<any | null> {
    try {
      const result = await this.client.query(
        'SELECT * FROM dsd_briefs WHERE id = $1 AND user_id = $2',
        [params.id, params.userId]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        tags: row.tags || [],
        slides: row.slides || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error getting brief with details:", error);
      return null;
    }
  }

  async createBriefWithSections(params: any): Promise<any> {
    try {
      const result = await this.client.query(`
        INSERT INTO dsd_briefs (id, user_id, client_profile_id, title, status, tags, define_section, shift_section, deliver_section, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        params.userId,
        params.projectId || null,
        params.title,
        'draft',
        params.tags || [],
        params.define_section || {},
        params.shift_section || {},
        params.deliver_section || {}
      ]);

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        tags: row.tags || [],
        slides: row.slides || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error creating brief with sections:", error);
      throw error;
    }
  }

  async updateBriefWithSections(params: { id: string; userId: string; patch: any }): Promise<any | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      if (params.patch.title !== undefined) {
        setClause.push(`title = $${++paramCount}`);
        values.push(params.patch.title);
      }
      if (params.patch.status !== undefined) {
        setClause.push(`status = $${++paramCount}`);
        values.push(params.patch.status);
      }
      if (params.patch.tags !== undefined) {
        setClause.push(`tags = $${++paramCount}`);
        values.push(params.patch.tags);
      }
      if (params.patch.define_section !== undefined) {
        setClause.push(`define_section = $${++paramCount}`);
        values.push(JSON.stringify(params.patch.define_section));
      }
      if (params.patch.shift_section !== undefined) {
        setClause.push(`shift_section = $${++paramCount}`);
        values.push(JSON.stringify(params.patch.shift_section));
      }
      if (params.patch.deliver_section !== undefined) {
        setClause.push(`deliver_section = $${++paramCount}`);
        values.push(JSON.stringify(params.patch.deliver_section));
      }

      if (setClause.length === 0) return null;

      setClause.push(`updated_at = NOW()`);
      values.push(params.id, params.userId);

      const result = await this.client.query(`
        UPDATE dsd_briefs 
        SET ${setClause.join(', ')}
        WHERE id = $${++paramCount} AND user_id = $${++paramCount}
        RETURNING *
      `, values);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        tags: row.tags || [],
        slides: row.slides || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error updating brief with sections:", error);
      return null;
    }
  }

  async updateBriefTags(params: { id: string; userId: string; add: string[]; remove: string[] }): Promise<any | null> {
    try {
      // Get current tags
      const current = await this.client.query(
        'SELECT tags FROM dsd_briefs WHERE id = $1 AND user_id = $2',
        [params.id, params.userId]
      );

      if (current.rows.length === 0) return null;

      let currentTags: string[] = current.rows[0].tags || [];
      
      // Remove tags
      if (params.remove.length > 0) {
        currentTags = currentTags.filter(tag => !params.remove.includes(tag));
      }

      // Add new tags (avoid duplicates)  
      if (params.add.length > 0) {
        const newTags = params.add.filter(tag => !currentTags.includes(tag));
        currentTags = [...currentTags, ...newTags];
      }

      // Update
      const result = await this.client.query(
        'UPDATE dsd_briefs SET tags = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
        [currentTags, params.id, params.userId]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        client_profile_id: row.client_profile_id,
        title: row.title,
        status: row.status,
        tags: row.tags || [],
        slides: row.slides || [],
        define_section: row.define_section,
        shift_section: row.shift_section,
        deliver_section: row.deliver_section,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error updating brief tags:", error);
      return null;
    }
  }

  async listMomentsWithPagination(params: {
    userId?: string;
    projectId?: string;
    q?: string;
    page: number;
    pageSize: number;
  }): Promise<{ rows: any[], total: number }> {
    try {
      let query = 'SELECT * FROM cultural_moments WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) FROM cultural_moments WHERE 1=1';
      const values: any[] = [];
      let paramCount = 0;

      if (params.q) {
        query += ` AND (title ILIKE $${++paramCount} OR description ILIKE $${paramCount})`;
        countQuery += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        values.push(`%${params.q}%`);
      }

      // Get total count
      const countResult = await this.client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination
      query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(params.pageSize, (params.page - 1) * params.pageSize);

      const result = await this.client.query(query, values);
      const rows = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        intensity: row.intensity,
        tags: row.tags || [],
        platforms: row.platforms || [],
        demographics: row.demographics || [],
        duration: row.duration,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      return { rows, total };
    } catch (error) {
      console.error("❌ Error in listMomentsWithPagination:", error);
      return { rows: [], total: 0 };
    }
  }

  async createMomentWithDetails(params: any): Promise<any> {
    try {
      const result = await this.client.query(`
        INSERT INTO cultural_moments (id, title, description, intensity, platforms, demographics, duration, tags, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `, [
        params.title,
        params.description,
        params.intensity,
        params.platforms || [],
        params.demographics || [],
        params.duration || null,
        params.tags || []
      ]);

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        intensity: row.intensity,
        tags: row.tags || [],
        platforms: row.platforms || [],
        demographics: row.demographics || [],
        duration: row.duration,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error creating moment with details:", error);
      throw error;
    }
  }

  async listUserFeedsForProject(params: { userId: string; projectId?: string }): Promise<any[]> {
    try {
      let query = 'SELECT * FROM user_feeds WHERE user_id = $1';
      const values = [params.userId];

      if (params.projectId) {
        query += ' AND project_id = $2';
        values.push(params.projectId);
      }

      query += ' ORDER BY created_at DESC';

      const result = await this.client.query(query, values);
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        feed_url: row.feed_url,
        title: row.title,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error("❌ Error listing user feeds for project:", error);
      return [];
    }
  }

  async createUserFeedWithValidation(params: any): Promise<any> {
    return this.createUserFeed(params);
  }

  async toggleUserFeedStatus(params: { id: string; userId: string }): Promise<any> {
    try {
      const result = await this.client.query(`
        UPDATE user_feeds 
        SET is_active = NOT is_active, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [params.id, params.userId]);

      if (result.rows.length === 0) {
        throw new Error('Feed not found');
      }

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        feed_url: row.feed_url,
        title: row.title,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error("❌ Error toggling user feed status:", error);
      throw error;
    }
  }

  async deleteUserFeedWithValidation(params: { id: string; userId: string }): Promise<void> {
    try {
      const result = await this.client.query(
        'DELETE FROM user_feeds WHERE id = $1 AND user_id = $2',
        [params.id, params.userId]
      );

      if (result.rowCount === 0) {
        throw new Error('Feed not found or access denied');
      }
    } catch (error) {
      console.error("❌ Error deleting user feed with validation:", error);
      throw error;
    }
  }

  // Capture Management
  async getCaptures(projectId: string): Promise<Capture[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM captures WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture));
    } catch (error) {
      console.error("❌ Error fetching captures:", error);
      return [];
    }
  }

  async getPendingCaptures(): Promise<Capture[]> {
    try {
      const result = await this.client.query(`
        SELECT * FROM captures 
        WHERE analysis_status = 'pending' 
        ORDER BY created_at ASC
        LIMIT 100
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        dsdTags: row.dsd_tags,
        dsdSection: row.dsd_section,
        viralScore: row.viral_score,
        culturalResonance: row.cultural_resonance,
        prediction: row.prediction,
        outcome: row.outcome,
        workspaceNotes: row.workspace_notes,
        briefSectionAssignment: row.brief_section_assignment,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture));
    } catch (error) {
      console.error("❌ Error fetching pending captures:", error);
      return [];
    }
  }

  async getUserCaptures(userId: string): Promise<Capture[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM captures WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title || 'Untitled Capture',
        content: row.content,
        url: row.url,
        platform: row.platform || 'unknown',
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags || [],
        metadata: row.metadata || {},
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status || 'pending',
        googleAnalysis: row.google_analysis,
        dsdTags: row.dsd_tags || {},
        dsdSection: row.dsd_section,
        viralScore: row.viral_score || 0,
        culturalResonance: row.cultural_resonance || {},
        prediction: row.prediction,
        outcome: row.outcome,
        workspaceNotes: row.workspace_notes,
        briefSectionAssignment: row.brief_section_assignment,
        status: row.status || 'pending',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture));
    } catch (error) {
      console.error("❌ Error fetching user captures:", error);
      return [];
    }
  }

  async getCaptureById(id: string): Promise<Capture | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM captures WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          projectId: row.project_id,
          userId: row.user_id,
          type: row.type,
          title: row.title,
          content: row.content,
          url: row.url,
          platform: row.platform,
          screenshotUrl: row.screenshot_url,
          summary: row.summary,
          tags: row.tags,
          metadata: row.metadata,
          truthAnalysis: row.truth_analysis,
          analysisStatus: row.analysis_status,
          googleAnalysis: row.google_analysis,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as Capture;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching capture:", error);
      return undefined;
    }
  }

  // Task Block #6: Enhanced capture detail with analysis data
  async getCaptureWithAnalysis(id: string): Promise<any | undefined> {
    try {
      const result = await this.client.query(`
        SELECT 
          c.id, c.project_id, c.user_id, c.title, c.content, c.url, c.platform,
          c.image_url, c.image_thumb_url, c.tags, c.note, c.ai_analysis,
          c.analysis_status, c.dsd_tags, c.dsd_section, c.created_at,
          cla.analysis_id, cla.provider, cla.mode, cla.status as analysis_status_latest,
          cla.summary as analysis_summary, cla.labels as analysis_labels, 
          cla.analyzed_at,
          (SELECT COUNT(*) FROM capture_analyses WHERE capture_id = c.id) as analysis_count,
          (SELECT COUNT(*) > 0 FROM capture_analyses WHERE capture_id = c.id AND mode = 'deep') as has_deep_analysis
        FROM captures c
        LEFT JOIN capture_latest_analysis cla ON c.id = cla.capture_id
        WHERE c.id = $1
        LIMIT 1
      `, [id]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          project_id: row.project_id,
          user_id: row.user_id,
          title: row.title,
          content: row.content,
          url: row.url,
          platform: row.platform,
          screenshot_url: row.image_url,
          summary: row.summary,
          tags: row.tags || [],
          metadata: row.metadata || {},
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          latest_analysis: row.analysis_id ? {
            status: row.analysis_status_latest,
            summary: row.analysis_summary,
            labels: row.analysis_labels || [],
            analyzed_at: row.analyzed_at,
            provider: row.provider,
            mode: row.mode
          } : null,
          analysis_count: parseInt(row.analysis_count) || 0,
          has_deep_analysis: row.has_deep_analysis || false
        };
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching capture with analysis:", error);
      return undefined;
    }
  }

  async createCapture(capture: InsertCapture): Promise<Capture> {
    try {
      const result = await this.client.query(`
        INSERT INTO captures (
          id, project_id, user_id, type, title, content, url, platform,
          screenshot_url, summary, tags, metadata, truth_analysis,
          analysis_status, google_analysis, status,
          dsd_tags, dsd_section, viral_score, cultural_resonance, 
          prediction, outcome, workspace_notes, brief_section_assignment,
          created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
          NOW(), NOW()
        )
        RETURNING *
      `, [
        capture.projectId,
        capture.userId,
        capture.type,
        capture.title || null,
        capture.content || null,
        capture.url || null,
        capture.platform || null,
        capture.screenshotUrl || null,
        capture.summary || null,
        JSON.stringify(capture.tags || []),
        JSON.stringify(capture.metadata || {}),
        capture.truthAnalysis ? JSON.stringify(capture.truthAnalysis) : null,
        capture.analysisStatus || 'pending',
        capture.googleAnalysis ? JSON.stringify(capture.googleAnalysis) : null,
        capture.status || 'active',
        JSON.stringify(capture.dsdTags || {}),
        capture.dsdSection || null,
        capture.viralScore || 0,
        JSON.stringify(capture.culturalResonance || {}),
        capture.prediction ? JSON.stringify(capture.prediction) : null,
        capture.outcome ? JSON.stringify(capture.outcome) : null,
        capture.workspaceNotes || null,
        capture.briefSectionAssignment || null
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        dsdTags: row.dsd_tags,
        dsdSection: row.dsd_section,
        viralScore: row.viral_score,
        culturalResonance: row.cultural_resonance,
        prediction: row.prediction,
        outcome: row.outcome,
        workspaceNotes: row.workspace_notes,
        briefSectionAssignment: row.brief_section_assignment,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture;
    } catch (error) {
      console.error("❌ Error creating capture:", error);
      throw error;
    }
  }

  async updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Map frontend field names to database columns
      const fieldMap: Record<string, string> = {
        'title': 'title',
        'content': 'content',
        'url': 'url',
        'platform': 'platform',
        'screenshotUrl': 'screenshot_url',
        'summary': 'summary',
        'tags': 'tags',
        'metadata': 'metadata',
        'truthAnalysis': 'truth_analysis',
        'analysisStatus': 'analysis_status',
        'googleAnalysis': 'google_analysis',
        'status': 'status',
        'dsdTags': 'dsd_tags',
        'dsdSection': 'dsd_section',
        'viralScore': 'viral_score',
        'culturalResonance': 'cultural_resonance',
        'prediction': 'prediction',
        'outcome': 'outcome',
        'workspaceNotes': 'workspace_notes',
        'briefSectionAssignment': 'brief_section_assignment'
      };

      // Handle custom fields from frontend
      if ('userNote' in updates) {
        const metadata = (updates.metadata as any) || {};
        updates.metadata = { ...metadata, userNote: (updates as any).userNote };
        delete (updates as any).userNote;
      }

      if ('customCopy' in updates) {
        const metadata = (updates.metadata as any) || {};
        updates.metadata = { ...metadata, customCopy: (updates as any).customCopy };
        delete (updates as any).customCopy;
      }

      // Build update query
      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (['tags', 'metadata', 'truthAnalysis', 'googleAnalysis', 'dsdTags', 'culturalResonance', 'prediction', 'outcome'].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE captures SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture;
    } catch (error) {
      console.error("❌ Error updating capture:", error);
      throw error;
    }
  }

  async deleteCapture(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM captures WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting capture:", error);
      throw error;
    }
  }

  // Content Radar Management
  async getContentItems(filter: { 
    category?: string; 
    platform?: string; 
    timeRange?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<ContentRadar[]> {
    try {
      let query = 'SELECT * FROM content_radar WHERE is_active = true';
      const params: any[] = [];
      let paramCount = 1;

      if (filter.category && filter.category !== 'all') {
        query += ` AND category = $${paramCount++}`;
        params.push(filter.category);
      }

      if (filter.platform && filter.platform !== 'all') {
        query += ` AND platform = $${paramCount++}`;
        params.push(filter.platform);
      }

      if (filter.timeRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filter.timeRange) {
          case '1h':
            startDate.setHours(now.getHours() - 1);
            break;
          case '24h':
            startDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        }
        
        query += ` AND created_at >= $${paramCount++}`;
        params.push(startDate.toISOString());
      }

      // Sorting
      switch (filter.sortBy) {
        case 'viral':
          query += ' ORDER BY viral_score DESC';
          break;
        case 'engagement':
          query += ' ORDER BY engagement DESC';
          break;
        case 'growth':
          query += ' ORDER BY growth_rate DESC';
          break;
        default:
          query += ' ORDER BY created_at DESC';
      }

      // Limit
      query += ` LIMIT $${paramCount++}`;
      params.push(filter.limit || 50);

      const result = await this.client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        url: row.url,
        content: row.content,
        summary: row.summary,
        hook1: row.hook1,
        hook2: row.hook2,
        category: row.category,
        platform: row.platform,
        viralScore: row.viral_score,
        engagement: row.engagement,
        growthRate: row.growth_rate,
        metadata: row.metadata,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ContentRadar));
    } catch (error) {
      console.error("❌ Error fetching content items:", error);
      return [];
    }
  }

  async getContentItemById(id: string): Promise<ContentRadar | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM content_radar WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          title: row.title,
          url: row.url,
          content: row.content,
          summary: row.summary,
          hook1: row.hook1,
          hook2: row.hook2,
          category: row.category,
          platform: row.platform,
          viralScore: row.viral_score,
          engagement: row.engagement,
          growthRate: row.growth_rate,
          metadata: row.metadata,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as ContentRadar;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching content item:", error);
      return undefined;
    }
  }

  async createContentItem(item: InsertContentRadar): Promise<ContentRadar> {
    try {
      const result = await this.client.query(`
        INSERT INTO content_radar (
          id, title, url, content, summary, hook1, hook2,
          category, platform, viral_score, engagement, growth_rate,
          metadata, is_active, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
        RETURNING *
      `, [
        item.title,
        item.url,
        item.content || null,
        item.summary || null,
        item.hook1 || null,
        item.hook2 || null,
        item.category,
        item.platform,
        item.viralScore || 0,
        item.engagement || 0,
        item.growthRate || 0,
        JSON.stringify(item.metadata || {}),
        item.isActive !== false
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        url: row.url,
        content: row.content,
        summary: row.summary,
        hook1: row.hook1,
        hook2: row.hook2,
        category: row.category,
        platform: row.platform,
        viralScore: row.viral_score,
        engagement: row.engagement,
        growthRate: row.growth_rate,
        metadata: row.metadata,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ContentRadar;
    } catch (error) {
      console.error("❌ Error creating content item:", error);
      throw error;
    }
  }

  async updateContentItem(id: string, updates: Partial<InsertContentRadar>): Promise<ContentRadar> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap: Record<string, string> = {
        'title': 'title',
        'url': 'url',
        'content': 'content',
        'summary': 'summary',
        'hook1': 'hook1',
        'hook2': 'hook2',
        'category': 'category',
        'platform': 'platform',
        'viralScore': 'viral_score',
        'engagement': 'engagement',
        'growthRate': 'growth_rate',
        'metadata': 'metadata',
        'isActive': 'is_active'
      };

      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (key === 'metadata') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE content_radar SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        url: row.url,
        content: row.content,
        summary: row.summary,
        hook1: row.hook1,
        hook2: row.hook2,
        category: row.category,
        platform: row.platform,
        viralScore: row.viral_score,
        engagement: row.engagement,
        growthRate: row.growth_rate,
        metadata: row.metadata,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ContentRadar;
    } catch (error) {
      console.error("❌ Error updating content item:", error);
      throw error;
    }
  }

  async deleteContentItem(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM content_radar WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting content item:", error);
      throw error;
    }
  }

  // Brief Management
  async getBriefs(projectId: string): Promise<Brief[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM briefs WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        templateType: row.template_type,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Brief));
    } catch (error) {
      console.error("❌ Error fetching briefs:", error);
      return [];
    }
  }

  async createBrief(brief: InsertBrief): Promise<Brief> {
    try {
      const result = await this.client.query(`
        INSERT INTO briefs (id, project_id, title, template_type, description, status, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `, [
        brief.projectId,
        brief.title,
        brief.templateType || 'jimmy-johns',
        brief.description || null,
        brief.status || 'draft'
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        templateType: row.template_type,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Brief;
    } catch (error) {
      console.error("❌ Error creating brief:", error);
      throw error;
    }
  }

  // Stats and Analytics
  async getStats(): Promise<any> {
    try {
      const [contentCount, recentScans, platformStats] = await Promise.all([
        this.client.query('SELECT COUNT(*) FROM content_radar WHERE is_active = true'),
        this.client.query('SELECT * FROM scan_history ORDER BY created_at DESC LIMIT 10'),
        this.client.query(`
          SELECT platform, COUNT(*) as count 
          FROM content_radar 
          WHERE is_active = true 
          GROUP BY platform
        `)
      ]);

      return {
        totalContent: parseInt(contentCount.rows[0].count),
        recentScans: recentScans.rows,
        platformBreakdown: platformStats.rows
      };
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      return { totalContent: 0, recentScans: [], platformBreakdown: [] };
    }
  }

  // Scan History
  async getRecentScans(limit: number = 10): Promise<any[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM scan_history ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error("❌ Error fetching recent scans:", error);
      return [];
    }
  }

  // Legacy support methods
  async getAllSources(): Promise<any[]> {
    return [];
  }

  async getSignals(filter: any): Promise<any[]> {
    // Map legacy signals to content radar
    return this.getContentItems(filter);
  }

  // Strategic Intelligence Implementation
  
  // Client Profile Management
  async getClientProfiles(userId: string): Promise<ClientProfile[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM client_profiles WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        brandVoice: row.brand_voice,
        targetAudience: row.target_audience,
        channelPreferences: row.channel_preferences,
        noGoZones: row.no_go_zones,
        competitiveLandscape: row.competitive_landscape,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ClientProfile));
    } catch (error) {
      console.error("❌ Error fetching client profiles:", error);
      return [];
    }
  }

  async getClientProfileById(id: string): Promise<ClientProfile | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM client_profiles WHERE id = $1 LIMIT 1',
        [id]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          brandVoice: row.brand_voice,
          targetAudience: row.target_audience,
          channelPreferences: row.channel_preferences,
          noGoZones: row.no_go_zones,
          competitiveLandscape: row.competitive_landscape,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as ClientProfile;
      }
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching client profile:", error);
      return undefined;
    }
  }

  async createClientProfile(profile: InsertClientProfile): Promise<ClientProfile> {
    try {
      const result = await this.client.query(`
        INSERT INTO client_profiles (
          id, user_id, name, brand_voice, target_audience, 
          channel_preferences, no_go_zones, competitive_landscape,
          created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        )
        RETURNING *
      `, [
        profile.userId,
        profile.name,
        profile.brandVoice || null,
        JSON.stringify(profile.targetAudience || {}),
        JSON.stringify(profile.channelPreferences || {}),
        JSON.stringify(profile.noGoZones || []),
        JSON.stringify(profile.competitiveLandscape || {})
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        brandVoice: row.brand_voice,
        targetAudience: row.target_audience,
        channelPreferences: row.channel_preferences,
        noGoZones: row.no_go_zones,
        competitiveLandscape: row.competitive_landscape,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ClientProfile;
    } catch (error) {
      console.error("❌ Error creating client profile:", error);
      throw error;
    }
  }

  async updateClientProfile(id: string, updates: Partial<InsertClientProfile>): Promise<ClientProfile> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap: Record<string, string> = {
        'name': 'name',
        'brandVoice': 'brand_voice',
        'targetAudience': 'target_audience',
        'channelPreferences': 'channel_preferences',
        'noGoZones': 'no_go_zones',
        'competitiveLandscape': 'competitive_landscape'
      };

      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (['targetAudience', 'channelPreferences', 'noGoZones', 'competitiveLandscape'].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE client_profiles SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        brandVoice: row.brand_voice,
        targetAudience: row.target_audience,
        channelPreferences: row.channel_preferences,
        noGoZones: row.no_go_zones,
        competitiveLandscape: row.competitive_landscape,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ClientProfile;
    } catch (error) {
      console.error("❌ Error updating client profile:", error);
      throw error;
    }
  }

  async deleteClientProfile(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM client_profiles WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting client profile:", error);
      throw error;
    }
  }

  // DSD Brief Management
  async getDsdBriefs(projectId: string): Promise<DsdBrief[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM dsd_briefs WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        clientId: row.client_id,
        title: row.title,
        defineContent: row.define_content,
        shiftContent: row.shift_content,
        deliverContent: row.deliver_content,
        googleSlidesUrl: row.google_slides_url,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as DsdBrief));
    } catch (error) {
      console.error("❌ Error fetching DSD briefs:", error);
      return [];
    }
  }

  async getUserDsdBriefs(userId: string): Promise<DsdBrief[]> {
    try {
      const result = await this.client.query(`
        SELECT db.* FROM dsd_briefs db
        JOIN projects p ON db.project_id = p.id
        WHERE p.user_id = $1 
        ORDER BY db.created_at DESC
      `, [userId]);
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        clientId: row.client_id,
        title: row.title,
        defineContent: row.define_content,
        shiftContent: row.shift_content,
        deliverContent: row.deliver_content,
        googleSlidesUrl: row.google_slides_url,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as DsdBrief));
    } catch (error) {
      console.error("❌ Error fetching user DSD briefs:", error);
      return [];
    }
  }

  async getDsdBriefById(id: string): Promise<DsdBrief | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM dsd_briefs WHERE id = $1 LIMIT 1',
        [id]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          projectId: row.project_id,
          clientId: row.client_id,
          title: row.title,
          defineContent: row.define_content,
          shiftContent: row.shift_content,
          deliverContent: row.deliver_content,
          googleSlidesUrl: row.google_slides_url,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as DsdBrief;
      }
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching DSD brief:", error);
      return undefined;
    }
  }

  async createDsdBrief(brief: InsertDsdBrief): Promise<DsdBrief> {
    try {
      const result = await this.client.query(`
        INSERT INTO dsd_briefs (
          id, project_id, client_id, title, define_content, 
          shift_content, deliver_content, google_slides_url, 
          status, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        )
        RETURNING *
      `, [
        brief.projectId,
        brief.clientId || null,
        brief.title,
        JSON.stringify(brief.defineContent || {}),
        JSON.stringify(brief.shiftContent || {}),
        JSON.stringify(brief.deliverContent || {}),
        brief.googleSlidesUrl || null,
        brief.status || 'draft'
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        clientId: row.client_id,
        title: row.title,
        defineContent: row.define_content,
        shiftContent: row.shift_content,
        deliverContent: row.deliver_content,
        googleSlidesUrl: row.google_slides_url,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as DsdBrief;
    } catch (error) {
      console.error("❌ Error creating DSD brief:", error);
      throw error;
    }
  }

  async updateDsdBrief(id: string, updates: Partial<InsertDsdBrief>): Promise<DsdBrief> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap: Record<string, string> = {
        'title': 'title',
        'clientId': 'client_id',
        'defineContent': 'define_content',
        'shiftContent': 'shift_content',
        'deliverContent': 'deliver_content',
        'googleSlidesUrl': 'google_slides_url',
        'status': 'status'
      };

      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (['defineContent', 'shiftContent', 'deliverContent'].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE dsd_briefs SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        clientId: row.client_id,
        title: row.title,
        defineContent: row.define_content,
        shiftContent: row.shift_content,
        deliverContent: row.deliver_content,
        googleSlidesUrl: row.google_slides_url,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as DsdBrief;
    } catch (error) {
      console.error("❌ Error updating DSD brief:", error);
      throw error;
    }
  }

  async deleteDsdBrief(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM dsd_briefs WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting DSD brief:", error);
      throw error;
    }
  }

  // Collective Intelligence
  async getCollectivePatterns(filter?: { patternType?: string; minConfidence?: number }): Promise<CollectivePattern[]> {
    try {
      let query = 'SELECT * FROM collective_patterns WHERE is_active = true';
      const params: any[] = [];
      let paramCount = 1;

      if (filter?.patternType) {
        query += ` AND pattern_type = $${paramCount++}`;
        params.push(filter.patternType);
      }

      if (filter?.minConfidence !== undefined) {
        query += ` AND confidence >= $${paramCount++}`;
        params.push(filter.minConfidence);
      }

      query += ' ORDER BY confidence DESC, last_updated DESC';

      const result = await this.client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        patternType: row.pattern_type,
        confidence: row.confidence ? row.confidence.toString() : null,
        contributingUsers: row.contributing_users,
        contributingCaptures: row.contributing_captures,
        firstDetected: row.first_detected,
        lastUpdated: row.last_updated,
        validationCount: row.validation_count,
        patternData: row.pattern_data,
        isActive: row.is_active
      } as CollectivePattern));
    } catch (error) {
      console.error("❌ Error fetching collective patterns:", error);
      return [];
    }
  }

  async createCollectivePattern(pattern: InsertCollectivePattern): Promise<CollectivePattern> {
    try {
      const result = await this.client.query(`
        INSERT INTO collective_patterns (
          id, pattern_type, confidence, contributing_users, contributing_captures,
          first_detected, last_updated, validation_count, pattern_data, is_active
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW(), $5, $6, $7
        )
        RETURNING *
      `, [
        pattern.patternType,
        pattern.confidence || 0.00,
        pattern.contributingUsers || 0,
        JSON.stringify(pattern.contributingCaptures || []),
        pattern.validationCount || 0,
        JSON.stringify(pattern.patternData || {}),
        pattern.isActive !== false
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        patternType: row.pattern_type,
        confidence: row.confidence ? row.confidence.toString() : null,
        contributingUsers: row.contributing_users,
        contributingCaptures: row.contributing_captures,
        firstDetected: row.first_detected,
        lastUpdated: row.last_updated,
        validationCount: row.validation_count,
        patternData: row.pattern_data,
        isActive: row.is_active
      } as CollectivePattern;
    } catch (error) {
      console.error("❌ Error creating collective pattern:", error);
      throw error;
    }
  }

  async updateCollectivePattern(id: string, updates: Partial<InsertCollectivePattern>): Promise<CollectivePattern> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap: Record<string, string> = {
        'patternType': 'pattern_type',
        'confidence': 'confidence',
        'contributingUsers': 'contributing_users',
        'contributingCaptures': 'contributing_captures',
        'validationCount': 'validation_count',
        'patternData': 'pattern_data',
        'isActive': 'is_active'
      };

      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (['contributingCaptures', 'patternData'].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      fields.push(`last_updated = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE collective_patterns SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        patternType: row.pattern_type,
        confidence: row.confidence ? row.confidence.toString() : null,
        contributingUsers: row.contributing_users,
        contributingCaptures: row.contributing_captures,
        firstDetected: row.first_detected,
        lastUpdated: row.last_updated,
        validationCount: row.validation_count,
        patternData: row.pattern_data,
        isActive: row.is_active
      } as CollectivePattern;
    } catch (error) {
      console.error("❌ Error updating collective pattern:", error);
      throw error;
    }
  }

  // Cultural Moments
  async getCulturalMoments(filter?: { status?: string; limit?: number }): Promise<CulturalMoment[]> {
    try {
      let query = 'SELECT * FROM cultural_moments WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (filter?.status) {
        query += ` AND status = $${paramCount++}`;
        params.push(filter.status);
      }

      query += ' ORDER BY emergence_date DESC';

      if (filter?.limit) {
        query += ` LIMIT $${paramCount++}`;
        params.push(filter.limit);
      }

      const result = await this.client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        momentType: row.moment_type,
        description: row.description,
        emergenceDate: row.emergence_date,
        peakDate: row.peak_date,
        contributingCaptures: row.contributing_captures,
        globalConfidence: row.global_confidence ? row.global_confidence.toString() : null,
        culturalContext: row.cultural_context,
        strategicImplications: row.strategic_implications,
        status: row.status,
        createdAt: row.created_at
      } as CulturalMoment));
    } catch (error) {
      console.error("❌ Error fetching cultural moments:", error);
      return [];
    }
  }

  async createCulturalMoment(moment: InsertCulturalMoment): Promise<CulturalMoment> {
    try {
      const result = await this.client.query(`
        INSERT INTO cultural_moments (
          id, moment_type, description, emergence_date, peak_date,
          contributing_captures, global_confidence, cultural_context,
          strategic_implications, status, created_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
        )
        RETURNING *
      `, [
        moment.momentType,
        moment.description || null,
        moment.emergenceDate || new Date(),
        moment.peakDate || null,
        JSON.stringify(moment.contributingCaptures || []),
        moment.globalConfidence || 0.00,
        JSON.stringify(moment.culturalContext || {}),
        moment.strategicImplications || null,
        moment.status || 'emerging'
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        momentType: row.moment_type,
        description: row.description,
        emergenceDate: row.emergence_date,
        peakDate: row.peak_date,
        contributingCaptures: row.contributing_captures,
        globalConfidence: row.global_confidence ? row.global_confidence.toString() : null,
        culturalContext: row.cultural_context,
        strategicImplications: row.strategic_implications,
        status: row.status,
        createdAt: row.created_at
      } as CulturalMoment;
    } catch (error) {
      console.error("❌ Error creating cultural moment:", error);
      throw error;
    }
  }

  async updateCulturalMoment(id: string, updates: Partial<InsertCulturalMoment>): Promise<CulturalMoment> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap: Record<string, string> = {
        'momentType': 'moment_type',
        'description': 'description',
        'emergenceDate': 'emergence_date',
        'peakDate': 'peak_date',
        'contributingCaptures': 'contributing_captures',
        'globalConfidence': 'global_confidence',
        'culturalContext': 'cultural_context',
        'strategicImplications': 'strategic_implications',
        'status': 'status'
      };

      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (['contributingCaptures', 'culturalContext'].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      values.push(id);

      const result = await this.client.query(
        `UPDATE cultural_moments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        momentType: row.moment_type,
        description: row.description,
        emergenceDate: row.emergence_date,
        peakDate: row.peak_date,
        contributingCaptures: row.contributing_captures,
        globalConfidence: row.global_confidence ? row.global_confidence.toString() : null,
        culturalContext: row.cultural_context,
        strategicImplications: row.strategic_implications,
        status: row.status,
        createdAt: row.created_at
      } as CulturalMoment;
    } catch (error) {
      console.error("❌ Error updating cultural moment:", error);
      throw error;
    }
  }

  // Hypothesis Tracking
  async getHypothesisValidations(captureId?: string): Promise<HypothesisValidation[]> {
    try {
      let query = 'SELECT * FROM hypothesis_validations';
      const params: any[] = [];

      if (captureId) {
        query += ' WHERE original_capture_id = $1';
        params.push(captureId);
      }

      query += ' ORDER BY validated_at DESC';

      const result = await this.client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        originalCaptureId: row.original_capture_id,
        validatingUserId: row.validating_user_id,
        originalPrediction: row.original_prediction,
        actualOutcome: row.actual_outcome,
        accuracyScore: row.accuracy_score ? row.accuracy_score.toString() : null,
        supportingEvidence: row.supporting_evidence,
        validatedAt: row.validated_at
      } as HypothesisValidation));
    } catch (error) {
      console.error("❌ Error fetching hypothesis validations:", error);
      return [];
    }
  }

  async createHypothesisValidation(validation: InsertHypothesisValidation): Promise<HypothesisValidation> {
    try {
      const result = await this.client.query(`
        INSERT INTO hypothesis_validations (
          id, original_capture_id, validating_user_id, original_prediction,
          actual_outcome, accuracy_score, supporting_evidence, validated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()
        )
        RETURNING *
      `, [
        validation.originalCaptureId,
        validation.validatingUserId,
        JSON.stringify(validation.originalPrediction),
        JSON.stringify(validation.actualOutcome),
        validation.accuracyScore || 0.00,
        validation.supportingEvidence || null
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        originalCaptureId: row.original_capture_id,
        validatingUserId: row.validating_user_id,
        originalPrediction: row.original_prediction,
        actualOutcome: row.actual_outcome,
        accuracyScore: row.accuracy_score ? row.accuracy_score.toString() : null,
        supportingEvidence: row.supporting_evidence,
        validatedAt: row.validated_at
      } as HypothesisValidation;
    } catch (error) {
      console.error("❌ Error creating hypothesis validation:", error);
      throw error;
    }
  }

  async updateHypothesisValidation(id: string, updates: Partial<InsertHypothesisValidation>): Promise<HypothesisValidation> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap: Record<string, string> = {
        'originalCaptureId': 'original_capture_id',
        'originalPrediction': 'original_prediction',
        'actualOutcome': 'actual_outcome',
        'accuracyScore': 'accuracy_score',
        'supportingEvidence': 'supporting_evidence'
      };

      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (['originalPrediction', 'actualOutcome'].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      values.push(id);

      const result = await this.client.query(
        `UPDATE hypothesis_validations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        originalCaptureId: row.original_capture_id,
        validatingUserId: row.validating_user_id,
        originalPrediction: row.original_prediction,
        actualOutcome: row.actual_outcome,
        accuracyScore: row.accuracy_score ? row.accuracy_score.toString() : null,
        supportingEvidence: row.supporting_evidence,
        validatedAt: row.validated_at
      } as HypothesisValidation;
    } catch (error) {
      console.error("❌ Error updating hypothesis validation:", error);
      throw error;
    }
  }

  // User Settings Management
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM user_settings WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          extensionSettings: row.extension_settings,
          dashboardSettings: row.dashboard_settings,
          searchSettings: row.search_settings,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as UserSettings;
      }
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching user settings:", error);
      return undefined;
    }
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    try {
      const result = await this.client.query(`
        INSERT INTO user_settings (
          id, user_id, extension_settings, dashboard_settings, 
          search_settings, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()
        )
        RETURNING *
      `, [
        settings.userId,
        JSON.stringify(settings.extensionSettings || {}),
        JSON.stringify(settings.dashboardSettings || {}),
        JSON.stringify(settings.searchSettings || {})
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        extensionSettings: row.extension_settings,
        dashboardSettings: row.dashboard_settings,
        searchSettings: row.search_settings,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as UserSettings;
    } catch (error) {
      console.error("❌ Error creating user settings:", error);
      throw error;
    }
  }

  async updateUserSettings(userId: string, updates: Partial<InsertUserSettings>): Promise<UserSettings> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [userId];
      let paramIndex = 2;

      if (updates.extensionSettings !== undefined) {
        updateFields.push(`extension_settings = $${paramIndex}`);
        values.push(JSON.stringify(updates.extensionSettings));
        paramIndex++;
      }
      if (updates.dashboardSettings !== undefined) {
        updateFields.push(`dashboard_settings = $${paramIndex}`);
        values.push(JSON.stringify(updates.dashboardSettings));
        paramIndex++;
      }
      if (updates.searchSettings !== undefined) {
        updateFields.push(`search_settings = $${paramIndex}`);
        values.push(JSON.stringify(updates.searchSettings));
        paramIndex++;
      }

      updateFields.push('updated_at = NOW()');

      const result = await this.client.query(`
        UPDATE user_settings
        SET ${updateFields.join(', ')}
        WHERE user_id = $1
        RETURNING *
      `, values);

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        extensionSettings: row.extension_settings,
        dashboardSettings: row.dashboard_settings,
        searchSettings: row.search_settings,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as UserSettings;
    } catch (error) {
      console.error("❌ Error updating user settings:", error);
      throw error;
    }
  }

  // Annotations Management
  async getAnnotations(captureId: string): Promise<Annotation[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM annotations WHERE capture_id = $1 ORDER BY version DESC',
        [captureId]
      );
      return result.rows.map(row => ({
        id: row.id,
        captureId: row.capture_id,
        userId: row.user_id,
        canvasData: row.canvas_data,
        annotationType: row.annotation_type,
        coordinates: row.coordinates,
        version: row.version,
        parentId: row.parent_id,
        isShared: row.is_shared,
        collaborators: row.collaborators,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Annotation));
    } catch (error) {
      console.error("❌ Error fetching annotations:", error);
      return [];
    }
  }

  async getAnnotationById(id: string): Promise<Annotation | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM annotations WHERE id = $1 LIMIT 1',
        [id]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          captureId: row.capture_id,
          userId: row.user_id,
          canvasData: row.canvas_data,
          annotationType: row.annotation_type,
          coordinates: row.coordinates,
          version: row.version,
          parentId: row.parent_id,
          isShared: row.is_shared,
          collaborators: row.collaborators,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as Annotation;
      }
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching annotation:", error);
      return undefined;
    }
  }

  async createAnnotation(annotation: InsertAnnotation): Promise<Annotation> {
    try {
      const result = await this.client.query(`
        INSERT INTO annotations (
          id, capture_id, user_id, canvas_data, annotation_type,
          coordinates, version, parent_id, is_shared, collaborators,
          created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
        RETURNING *
      `, [
        annotation.captureId,
        annotation.userId,
        JSON.stringify(annotation.canvasData),
        annotation.annotationType || 'canvas',
        JSON.stringify(annotation.coordinates || null),
        annotation.version || 1,
        annotation.parentId || null,
        annotation.isShared || false,
        JSON.stringify(annotation.collaborators || [])
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        captureId: row.capture_id,
        userId: row.user_id,
        canvasData: row.canvas_data,
        annotationType: row.annotation_type,
        coordinates: row.coordinates,
        version: row.version,
        parentId: row.parent_id,
        isShared: row.is_shared,
        collaborators: row.collaborators,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Annotation;
    } catch (error) {
      console.error("❌ Error creating annotation:", error);
      throw error;
    }
  }

  async updateAnnotation(id: string, updates: Partial<InsertAnnotation>): Promise<Annotation> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [id];
      let paramIndex = 2;

      if (updates.canvasData !== undefined) {
        updateFields.push(`canvas_data = $${paramIndex}`);
        values.push(JSON.stringify(updates.canvasData));
        paramIndex++;
      }
      if (updates.coordinates !== undefined) {
        updateFields.push(`coordinates = $${paramIndex}`);
        values.push(JSON.stringify(updates.coordinates));
        paramIndex++;
      }
      if (updates.isShared !== undefined) {
        updateFields.push(`is_shared = $${paramIndex}`);
        values.push(updates.isShared);
        paramIndex++;
      }
      if (updates.collaborators !== undefined) {
        updateFields.push(`collaborators = $${paramIndex}`);
        values.push(JSON.stringify(updates.collaborators));
        paramIndex++;
      }

      updateFields.push('updated_at = NOW()');

      const result = await this.client.query(`
        UPDATE annotations
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `, values);

      const row = result.rows[0];
      return {
        id: row.id,
        captureId: row.capture_id,
        userId: row.user_id,
        canvasData: row.canvas_data,
        annotationType: row.annotation_type,
        coordinates: row.coordinates,
        version: row.version,
        parentId: row.parent_id,
        isShared: row.is_shared,
        collaborators: row.collaborators,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Annotation;
    } catch (error) {
      console.error("❌ Error updating annotation:", error);
      throw error;
    }
  }

  async deleteAnnotation(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM annotations WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting annotation:", error);
      throw error;
    }
  }

  // Analytics Data Management
  async getAnalyticsData(filter: {
    userId?: string;
    projectId?: string;
    metricType?: string;
    timeframe?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AnalyticsData[]> {
    try {
      let query = 'SELECT * FROM analytics_data WHERE 1=1';
      const values: any[] = [];
      let paramIndex = 1;

      if (filter.userId) {
        query += ` AND user_id = $${paramIndex}`;
        values.push(filter.userId);
        paramIndex++;
      }
      if (filter.projectId) {
        query += ` AND project_id = $${paramIndex}`;
        values.push(filter.projectId);
        paramIndex++;
      }
      if (filter.metricType) {
        query += ` AND metric_type = $${paramIndex}`;
        values.push(filter.metricType);
        paramIndex++;
      }
      if (filter.timeframe) {
        query += ` AND timeframe = $${paramIndex}`;
        values.push(filter.timeframe);
        paramIndex++;
      }
      if (filter.startDate) {
        query += ` AND recorded_at >= $${paramIndex}`;
        values.push(filter.startDate);
        paramIndex++;
      }
      if (filter.endDate) {
        query += ` AND recorded_at <= $${paramIndex}`;
        values.push(filter.endDate);
        paramIndex++;
      }

      query += ' ORDER BY recorded_at DESC';

      const result = await this.client.query(query, values);
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        projectId: row.project_id,
        metricType: row.metric_type,
        metricValue: row.metric_value.toString(),
        recordedAt: row.recorded_at,
        timeframe: row.timeframe,
        dimensions: row.dimensions,
        aggregatedData: row.aggregated_data
      } as AnalyticsData));
    } catch (error) {
      console.error("❌ Error fetching analytics data:", error);
      return [];
    }
  }

  async createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData> {
    try {
      const result = await this.client.query(`
        INSERT INTO analytics_data (
          id, user_id, project_id, metric_type, metric_value,
          recorded_at, timeframe, dimensions, aggregated_data
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, NOW(), $5, $6, $7
        )
        RETURNING *
      `, [
        data.userId,
        data.projectId || null,
        data.metricType,
        data.metricValue,
        data.timeframe || 'daily',
        JSON.stringify(data.dimensions || {}),
        JSON.stringify(data.aggregatedData || {})
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        projectId: row.project_id,
        metricType: row.metric_type,
        metricValue: row.metric_value.toString(),
        recordedAt: row.recorded_at,
        timeframe: row.timeframe,
        dimensions: row.dimensions,
        aggregatedData: row.aggregated_data
      } as AnalyticsData;
    } catch (error) {
      console.error("❌ Error creating analytics data:", error);
      throw error;
    }
  }

  async getDashboardMetrics(userId: string): Promise<any> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [captures, viral, trends] = await Promise.all([
        this.client.query(`
          SELECT COUNT(*) as total, 
                 COUNT(CASE WHEN created_at >= $2 THEN 1 END) as recent
          FROM captures 
          WHERE user_id = $1
        `, [userId, sevenDaysAgo]),
        
        this.client.query(`
          SELECT AVG(viral_score) as avg_viral,
                 MAX(viral_score) as max_viral
          FROM captures 
          WHERE user_id = $1 AND viral_score IS NOT NULL
        `, [userId]),
        
        this.getAnalyticsData({
          userId,
          metricType: 'trend',
          startDate: sevenDaysAgo
        })
      ]);

      return {
        totalCaptures: parseInt(captures.rows[0].total),
        recentCaptures: parseInt(captures.rows[0].recent),
        avgViralScore: parseFloat(viral.rows[0].avg_viral || '0'),
        maxViralScore: parseFloat(viral.rows[0].max_viral || '0'),
        trendData: trends
      };
    } catch (error) {
      console.error("❌ Error fetching dashboard metrics:", error);
      return {
        totalCaptures: 0,
        recentCaptures: 0,
        avgViralScore: 0,
        maxViralScore: 0,
        trendData: []
      };
    }
  }

  // Search and Filtering
  async searchCaptures(query: string, filters?: any): Promise<Capture[]> {
    try {
      let sql = `
        SELECT * FROM captures 
        WHERE (
          title ILIKE $1 OR 
          content ILIKE $1 OR 
          summary ILIKE $1 OR
          tags::text ILIKE $1
        )
      `;
      const values: any[] = [`%${query}%`];
      let paramIndex = 2;

      if (filters?.platform) {
        sql += ` AND platform = $${paramIndex}`;
        values.push(filters.platform);
        paramIndex++;
      }
      if (filters?.projectId) {
        sql += ` AND project_id = $${paramIndex}`;
        values.push(filters.projectId);
        paramIndex++;
      }
      if (filters?.analysisStatus) {
        sql += ` AND analysis_status = $${paramIndex}`;
        values.push(filters.analysisStatus);
        paramIndex++;
      }

      sql += ' ORDER BY created_at DESC LIMIT 100';

      const result = await this.client.query(sql, values);
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        dsdTags: row.dsd_tags,
        dsdSection: row.dsd_section,
        viralScore: row.viral_score,
        culturalResonance: row.cultural_resonance,
        prediction: row.prediction,
        outcome: row.outcome,
        workspaceNotes: row.workspace_notes,
        briefSectionAssignment: row.brief_section_assignment,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture));
    } catch (error) {
      console.error("❌ Error searching captures:", error);
      return [];
    }
  }

  // Job Management Methods
  async createJob(input: { type: string; payload: any; userId?: string }) {
    const { type, payload, userId } = input;
    const id = uuid();
    
    const result = await this.client.query(`
      INSERT INTO jobs (id, type, payload, status, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, type, JSON.stringify(payload), "queued", userId || null]);
    
    const row = result.rows[0];
    return {
      id: row.id,
      type: row.type,
      payload: row.payload,
      status: row.status,
      result: row.result,
      error: row.error,
      attempts: row.attempts,
      max_attempts: row.max_attempts,
      created_at: row.created_at,
      started_at: row.started_at,
      finished_at: row.finished_at,
      user_id: row.user_id
    };
  }

  async getJobById(id: string) {
    const result = await this.client.query('SELECT * FROM jobs WHERE id = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      type: row.type,
      payload: row.payload,
      status: row.status,
      result: row.result,
      error: row.error,
      attempts: row.attempts,
      max_attempts: row.max_attempts,
      created_at: row.created_at,
      started_at: row.started_at,
      finished_at: row.finished_at,
      user_id: row.user_id
    };
  }

  /**
   * Atomically take the oldest queued job and mark running.
   * NOTE: Supabase's JS client doesn't expose row-level locks; we emulate atomics with RPC-like update.
   */
  async takeNextQueuedJob() {
    // 1) Find the oldest queued job
    const findResult = await this.client.query(
      'SELECT * FROM jobs WHERE status = $1 ORDER BY created_at ASC LIMIT 1',
      ['queued']
    );
    
    const job = findResult.rows[0];
    if (!job) return null;

    // 2) Try to update to running if still queued
    const updateResult = await this.client.query(`
      UPDATE jobs 
      SET status = $1, started_at = NOW(), attempts = COALESCE(attempts, 0) + 1
      WHERE id = $2 AND status = $3
      RETURNING *
    `, ['running', job.id, 'queued']);

    if (updateResult.rows.length === 0) {
      // Someone else took it, or conflict – just return null and worker loop will try again
      return null;
    }
    
    const row = updateResult.rows[0];
    return {
      id: row.id,
      type: row.type,
      payload: row.payload,
      status: row.status,
      result: row.result,
      error: row.error,
      attempts: row.attempts,
      max_attempts: row.max_attempts,
      created_at: row.created_at,
      started_at: row.started_at,
      finished_at: row.finished_at,
      user_id: row.user_id
    };
  }

  async completeJob(id: string, result: any) {
    await this.client.query(
      'UPDATE jobs SET status = $1, finished_at = NOW(), result = $2 WHERE id = $3',
      ['done', JSON.stringify(result), id]
    );
  }

  async failJob(id: string, errMsg: string) {
    await this.client.query(
      'UPDATE jobs SET status = $1, finished_at = NOW(), error = $2 WHERE id = $3',
      ['failed', errMsg, id]
    );
  }

  async retryJob(id: string, errMsg: string) {
    // Move back to queued if attempts < max_attempts
    const result = await this.client.query('SELECT * FROM jobs WHERE id = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) throw new Error("Job not found");
    
    const job = result.rows[0];
    if ((job.attempts || 0) >= (job.max_attempts || 3)) {
      return this.failJob(id, errMsg || "max attempts reached");
    }
    
    await this.client.query(
      'UPDATE jobs SET status = $1, error = $2 WHERE id = $3',
      ['queued', errMsg || null, id]
    );
  }

  // Extension Management Implementation
  async createPairingCode(data: { code: string; userId: string; projectId?: string | null; deviceLabel?: string | null; expiresAt: Date }): Promise<void> {
    await this.client.query(`
      INSERT INTO extension_pairing_codes (code, user_id, project_id, device_label, expires_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [data.code, data.userId, data.projectId, data.deviceLabel, data.expiresAt]);
  }

  async validatePairingCode(code: string): Promise<{ user_id: string; project_id?: string | null; device_label?: string | null } | null> {
    const result = await this.client.query(`
      SELECT * FROM extension_pairing_codes 
      WHERE code = $1 AND used_at IS NULL AND expires_at > NOW()
    `, [code]);
    return result.rows[0] || null;
  }

  async markPairingCodeUsed(code: string, deviceId: string): Promise<void> {
    await this.client.query(`
      UPDATE extension_pairing_codes 
      SET used_at = NOW(), device_id = $2 
      WHERE code = $1
    `, [code, deviceId]);
  }

  async createExtensionDevice(data: { userId: string; projectId?: string | null; label?: string | null; lastSeenAt: Date }): Promise<{ id: string }> {
    const result = await this.client.query(`
      INSERT INTO extension_devices (user_id, project_id, label, last_seen_at)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [data.userId, data.projectId, data.label, data.lastSeenAt]);
    return result.rows[0];
  }

  async getExtensionDevice(deviceId: string): Promise<{ user_id: string; revoked_at?: Date | null } | null> {
    const result = await this.client.query(`
      SELECT * FROM extension_devices WHERE id = $1
    `, [deviceId]);
    return result.rows[0] || null;
  }

  async listExtensionDevices(userId: string): Promise<any[]> {
    const result = await this.client.query(`
      SELECT * FROM extension_devices 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);
    return result.rows;
  }

  async updateDeviceHeartbeat(deviceId: string): Promise<void> {
    await this.client.query(`
      UPDATE extension_devices 
      SET last_seen_at = NOW() 
      WHERE id = $1
    `, [deviceId]);
  }

  async updateDeviceLabel(deviceId: string, label: string): Promise<void> {
    await this.client.query(`
      UPDATE extension_devices 
      SET label = $2 
      WHERE id = $1
    `, [deviceId, label]);
  }

  async revokeDevice(deviceId: string): Promise<void> {
    await this.client.query(`
      UPDATE extension_devices 
      SET revoked_at = NOW() 
      WHERE id = $1
    `, [deviceId]);
  }
}

// Brief assets interface
export interface BriefAssetRecord {
  id?: string;
  brief_id: string;
  kind: 'image' | 'video' | 'graphic';
  storage_path: string;
  width?: number;
  height?: number;
  mime?: string;
  meta?: any;
}

export async function recordBriefAsset(db: any, asset: BriefAssetRecord) {
  // db is the postgres client or supabase client
  const { data, error } = await db
    .from('brief_assets')
    .insert({
      brief_id: asset.brief_id,
      kind: asset.kind,
      storage_path: asset.storage_path,
      width: asset.width ?? null,
      height: asset.height ?? null,
      mime: asset.mime ?? null,
      meta: asset.meta ?? {}
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const storage = new DatabaseStorage();