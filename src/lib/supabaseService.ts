import { supabase } from './supabase';
import { UserStats, Grade, UserRole, Card as CardType, AppNotification } from '../types';

// Helper para generar correos válidos a partir de nombres de usuario (con espacios, acentos, etc.)
const normalizeEmail = (username: string) => {
  const cleanInput = username.trim().toLowerCase();
  if (cleanInput.includes('@')) return cleanInput; // Si ya es un email, usarlo tal cual

  const normalized = username.trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Solo letras y números (local part válida)
  
  return `${normalized}@cardacademy.app`;
};

// Flag to avoid retrying last_active if it's missing in DB
let isLastActiveColumnPresent = true;

export const supabaseService = {
  async getProfile(userId: string, metadata: any = {}): Promise<UserStats> {
    try {
      const stats = await this.fetchUserStats(userId);
      
      // Proactive admin elevation
      if (stats.username.toLowerCase() === 'admin' && stats.role === 'Student') {
        console.log('[Supabase] Elevando usuario admin a rol Admin automáticamente...');
        stats.role = 'Admin';
        stats.grade = '1A';
        stats.assignedGroups = [];
        stats.assignedSubjects = [];
        await this.updateUserStats(userId, { 
          role: 'Admin', 
          grade: '1A',
          assignedGroups: [],
          assignedSubjects: []
        });
      }
      return stats;
    } catch (error: any) {
      if (error.code === 'PGRST116' || error.message === 'Profile not found') {
        // Si tenemos metadata, podemos intentar regenerar el perfil (Self-Healing)
        if (metadata && metadata.username) {
          console.warn(`[Supabase] Perfil no encontrado para ${metadata.username}. Intentando auto-recuperación...`);
          try {
            const role = metadata.role || 'Student';
            const grade = metadata.grade || (role === 'Student' ? '2A' : (role === 'Teacher' ? 'Cuerpo Académico' : '1A'));
            
            const initialStats: UserStats = {
              id: userId,
              username: metadata.username,
              role: role,
              grade: grade as any,
              tokens: 0,
              streak: 0,
              collection: [],
              unstickedCards: [],
              completedTasks: [],
              pendingTasks: [],
              assignedSubjects: metadata.assignedSubjects || (role === 'Teacher' ? [] : role === 'Admin' ? [] : ["math_2"]),
              assignedGroups: metadata.assignedGroups || (role === 'Teacher' ? [] : role === 'Admin' ? [] : [grade as any]),
              packCurrencies: { pack_jacobo: 0, pack_culiacan: 0, pack_six_seven: 0 }
            };

            await supabase.from('users').upsert({
              id: userId,
              username: initialStats.username,
              role: initialStats.role,
              grade: initialStats.grade,
              tokens: initialStats.tokens,
              streak: initialStats.streak,
              assigned_subjects: initialStats.assignedSubjects,
              assigned_groups: initialStats.assignedGroups,
              completed_tasks: initialStats.completedTasks,
              pending_tasks: initialStats.pendingTasks,
              unsticked_cards: initialStats.unstickedCards,
              pack_currencies: initialStats.packCurrencies,
              daily_limits: {
                lastResetDate: new Date().toDateString(),
                easyCompleted: 0,
                mediumCompleted: 0,
                hardCompleted: 0,
                totalCompleted: 0
              }
            });

            console.log(`[Supabase] Perfil recuperado exitosamente para ${metadata.username}`);
            return initialStats;
          } catch (recoveryError) {
            console.error('[Supabase] Error crítico en auto-recuperación:', recoveryError);
          }
        }
        throw new Error('Tu perfil de usuario no fue encontrado.');
      }
      throw error;
    }
  },

  // Auth
  async heartbeat(userId: string) {
    if (!isLastActiveColumnPresent) return;
    const now = new Date().toISOString();
    try {
      return await this.updateUserStats(userId, { lastActive: now });
    } catch (e) {
      // Ignorar errores en heartbeat para no interrumpir la experiencia
    }
  },

  async signUp(username: string, password: string, role: UserRole, grade?: Grade, teacherData?: { assignedSubjects: string[], assignedGroups: string[] }) {
    const email = normalizeEmail(username);
    console.log(`[Supabase Auth] Intentando registrar: ${email} (Original: ${username})`);
    
    // Check if user already exists in auth
    const { data: dataAuth, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          grade,
          username: username.trim(),
          assignedSubjects: teacherData?.assignedSubjects || (role === 'Student' ? ["math_2"] : []),
          assignedGroups: teacherData?.assignedGroups || (role === 'Student' ? [grade || "2A"] : [])
        }
      }
    });

    if (error) {
      console.error(`[Supabase Auth] Error en signUp:`, error);
      if (error.message.includes('User already registered')) {
        throw new Error('Este usuario ya existe en el sistema de autenticación. Intenta iniciar sesión.');
      }
      throw error;
    }
    if (!dataAuth.user) throw new Error('No se recibieron datos del usuario al registrarse');

    // Create profile
    const initialStats: UserStats = {
      id: dataAuth.user.id,
      username,
      role,
      grade: grade || (role === 'Student' ? '2A' : (role === 'Teacher' ? 'Cuerpo Académico' as any : '1A' as any)),
      tokens: 0,
      streak: 0,
      collection: [],
      unstickedCards: [],
      completedTasks: [],
      pendingTasks: [],
      assignedSubjects: role === "Teacher" ? (teacherData?.assignedSubjects || []) : role === "Admin" ? [] : ["math_2"],
      assignedGroups: role === "Teacher" ? (teacherData?.assignedGroups || []) : role === "Admin" ? [] : [grade || "2A"],
      packCurrencies: {
        pack_jacobo: 0,
        pack_culiacan: 0,
        pack_six_seven: 0,
      }
    };

    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: dataAuth.user.id,
        username: initialStats.username,
        role: initialStats.role,
        grade: initialStats.grade,
        tokens: initialStats.tokens,
        streak: initialStats.streak,
        assigned_subjects: initialStats.assignedSubjects,
        assigned_groups: initialStats.assignedGroups,
        completed_tasks: initialStats.completedTasks,
        pending_tasks: initialStats.pendingTasks,
        unsticked_cards: initialStats.unstickedCards,
        pack_currencies: initialStats.packCurrencies,
        daily_limits: initialStats.dailyLimits || {
          lastResetDate: new Date().toDateString(),
          easyCompleted: 0,
          mediumCompleted: 0,
          hardCompleted: 0,
          totalCompleted: 0
        }
      });

    if (profileError) throw profileError;

    return { user: dataAuth.user, stats: initialStats };
  },

  async signIn(username: string, password: string) {
    const primaryEmail = normalizeEmail(username);
    
    // El dominio de respaldo se genera solo si el input original no era un email completo
    const secondaryEmail = !username.includes('@') 
      ? normalizeEmail(username).replace('@cardacademy.app', '@cardacademy.demo.app') 
      : null;
    
    console.log(`[Supabase Auth] Intentando login: ${primaryEmail}`);

    let { data, error } = await supabase.auth.signInWithPassword({
      email: primaryEmail,
      password,
    });

    // Si falla con el primario y no es un email directo, intentamos el secundario (compatibilidad antigua)
    if (error && error.message === 'Invalid login credentials' && secondaryEmail) {
      console.log(`[Supabase Auth] Reintentando con: ${secondaryEmail}`);
      const retry = await supabase.auth.signInWithPassword({
        email: secondaryEmail,
        password,
      });
      
      if (!retry.error) {
        data = retry.data;
        error = null;
        console.log(`[Supabase Auth] Login exitoso usando el dominio de respaldo (.demo)`);
      }
    }

    if (error) {
      console.error(`[Supabase Auth] Error en signIn:`, error.message);
      if (error.message === 'Invalid login credentials') {
        throw new Error('Usuario o contraseña incorrectos. Verifica tus datos.');
      }
      throw error;
    }
    if (!data.user) throw new Error('No se recibieron datos del usuario al iniciar sesión');
    
    const stats = await this.getProfile(data.user.id, data.user.user_metadata);

    return { user: data.user, stats };
  },

  async deleteUser(userId: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Lanzamos el error específico que viene del servidor
        throw new Error(data.error || 'Error al eliminar usuario del sistema.');
      }
      
      return data;
    } catch (error: any) {
      console.error('[Supabase Admin] Error total:', error);
      // Re-lanzamos el error para que el componente UI lo muestre
      throw error;
    }
  },

  async adminCreateUser(userData: any) {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al crear usuario.');
    return data;
  },

  // Data Fetching
  async fetchUserStats(userId: string): Promise<UserStats> {
    const columns = `id, username, role, grade, tokens, streak, assigned_subjects, assigned_groups, completed_tasks, pending_tasks, unsticked_cards, pack_currencies, daily_limits${isLastActiveColumnPresent ? ', last_active' : ''}`;
    
    let { data, error } = await supabase
      .from('users')
      .select(columns)
      .eq('id', userId)
      .maybeSingle() as any;
    
    // Check for "42703" (Undefined Column) or string match
    if (error && (error.code === '42703' || (error.message.includes('column') && error.message.includes('last_active'))) && isLastActiveColumnPresent) {
      isLastActiveColumnPresent = false;
      const retry = await supabase
        .from('users')
        .select('id, username, role, grade, tokens, streak, assigned_subjects, assigned_groups, completed_tasks, pending_tasks, unsticked_cards, pack_currencies, daily_limits')
        .eq('id', userId)
        .maybeSingle() as any;
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[Supabase] Error fetching user stats:', error.message);
      throw error;
    }

    if (!data) {
      const notFoundError = new Error('Profile not found');
      (notFoundError as any).code = 'PGRST116'; // Simulate the "no rows" error code for existing catch blocks
      throw notFoundError;
    }

    // Fetch collection from user_cards
    const { data: cardsData, error: cardsError } = await supabase
      .from('user_cards')
      .select('card_id')
      .eq('user_id', userId);

    if (cardsError) throw cardsError;

    const stats: UserStats = {
      id: data.id,
      username: data.username,
      role: data.role,
      grade: data.grade,
      tokens: data.tokens,
      streak: data.streak,
      assignedSubjects: data.assigned_subjects || [],
      assignedGroups: data.assigned_groups || [],
      completedTasks: data.completed_tasks || [],
      pendingTasks: data.pending_tasks || [],
      unstickedCards: data.unsticked_cards || [],
      collection: cardsData.map(c => c.card_id),
      packCurrencies: data.pack_currencies || { pack_jacobo: 0, pack_culiacan: 0, pack_six_seven: 0 },
      dailyLimits: data.daily_limits,
      lastActive: data.last_active
    };

    // Proactive correction for admin role
    if (stats.username.toLowerCase() === 'admin' && stats.role === 'Student') {
      console.log('[Supabase] Corrigiendo rol de admin en recuperación de sesión...');
      stats.role = 'Admin';
      stats.grade = '1A';
      stats.assignedGroups = [];
      stats.assignedSubjects = [];
      // We don't necessarily update DB here to avoid side-effects in a 'fetch' call, 
      // but the UI will see the correct role.
    }

    return stats;
  },

  async updateUserStats(userId: string, stats: Partial<UserStats>) {
    const updateData: any = {};
    if (stats.username !== undefined) updateData.username = stats.username;
    if (stats.role !== undefined) updateData.role = stats.role;
    if (stats.grade !== undefined) updateData.grade = stats.grade;
    if (stats.tokens !== undefined) updateData.tokens = stats.tokens;
    if (stats.streak !== undefined) updateData.streak = stats.streak;
    if (stats.assignedSubjects !== undefined) updateData.assigned_subjects = stats.assignedSubjects;
    if (stats.assignedGroups !== undefined) updateData.assigned_groups = stats.assignedGroups;
    if (stats.completedTasks !== undefined) updateData.completed_tasks = stats.completedTasks;
    if (stats.pendingTasks !== undefined) updateData.pending_tasks = stats.pendingTasks;
    if (stats.unstickedCards !== undefined) updateData.unsticked_cards = stats.unstickedCards;
    if (stats.packCurrencies !== undefined) updateData.pack_currencies = stats.packCurrencies;
    if (stats.dailyLimits !== undefined) updateData.daily_limits = stats.dailyLimits;
    if (stats.lastActive !== undefined && isLastActiveColumnPresent) updateData.last_active = stats.lastActive;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        if (error.message.includes('column') && error.message.includes('last_active')) {
           isLastActiveColumnPresent = false;
           // Retry without problematic column
           delete updateData.last_active;
           if (Object.keys(updateData).length > 0) {
             await supabase.from('users').update(updateData).eq('id', userId);
           }
        } else {
          throw error;
        }
      }
    }

    // Sync collection if provided
    if (stats.collection !== undefined) {
      // For simplicity in this demo, let's just upsert all of them.
      // In a real app, you'd diff or use a stored procedure.
      const cardInserts = stats.collection.map(cardId => ({
        user_id: userId,
        card_id: cardId
      }));

      if (cardInserts.length > 0) {
        const { error: cardsError } = await supabase
          .from('user_cards')
          .upsert(cardInserts, { onConflict: 'user_id,card_id' });
        
        if (cardsError) throw cardsError;
      }
    }
  },

  async addUserCard(userId: string, cardId: string) {
    const { error } = await supabase
      .from('user_cards')
      .upsert({ user_id: userId, card_id: cardId }, { onConflict: 'user_id,card_id' });
    
    if (error) throw error;
  },

  async removeUserCard(userId: string, cardId: string) {
    const { error } = await supabase
      .from('user_cards')
      .delete()
      .eq('user_id', userId)
      .eq('card_id', cardId);
    
    if (error) throw error;
  },

  async fetchAllUsers(): Promise<UserStats[]> {
    const columns = `id, username, role, grade, tokens, streak, assigned_subjects, assigned_groups, completed_tasks, pending_tasks, unsticked_cards, pack_currencies, daily_limits${isLastActiveColumnPresent ? ', last_active' : ''}`;
    
    let { data, error } = await supabase
      .from('users')
      .select(columns) as any;

    if (error && (error.code === '42703' || (error.message.includes('column') && error.message.includes('last_active'))) && isLastActiveColumnPresent) {
      isLastActiveColumnPresent = false;
      const retry = await supabase
        .from('users')
        .select('id, username, role, grade, tokens, streak, assigned_subjects, assigned_groups, completed_tasks, pending_tasks, unsticked_cards, pack_currencies, daily_limits') as any;
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[Supabase] Error fetching all users:', error.message);
      throw error;
    }

    // This is expensive if there are many users, but for a start:
    const users: UserStats[] = await Promise.all(data.map(async u => {
      const { data: cardsData } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', u.id);
      
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        grade: u.grade,
        tokens: u.tokens,
        streak: u.streak,
        assignedSubjects: u.assigned_subjects || [],
        assignedGroups: u.assigned_groups || [],
        completedTasks: u.completed_tasks || [],
        pendingTasks: u.pending_tasks || [],
        unstickedCards: u.unsticked_cards || [],
        collection: (cardsData || []).map(c => c.card_id),
        packCurrencies: u.pack_currencies || { pack_jacobo: 0, pack_culiacan: 0, pack_six_seven: 0 },
        dailyLimits: u.daily_limits,
        lastActive: u.last_active
      };
    }));

    return users;
  },

  async findUserByUsername(username: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .ilike('username', username)
      .maybeSingle();
    
    if (error) return null;
    return data?.id || null;
  },

  async getGlobalMasterKey(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('pack_currencies')
        .ilike('username', 'admin')
        .maybeSingle();
      
      if (error || !data) return null;
      return (data.pack_currencies as any)?.masterTeacherKey || null;
    } catch (e) {
      return null;
    }
  },

  async setGlobalMasterKey(key: string): Promise<void> {
    try {
      const adminId = await this.findUserByUsername('admin');
      if (!adminId) return;

      const { data } = await supabase
        .from('users')
        .select('pack_currencies')
        .eq('id', adminId)
        .single();
      
      const currentCurrencies = data?.pack_currencies || {};
      
      await supabase
        .from('users')
        .update({ 
          pack_currencies: { 
            ...currentCurrencies, 
            masterTeacherKey: key 
          } 
        })
        .eq('id', adminId);
    } catch (e) {
      console.error('Error setting global key:', e);
    }
  },

  async updatePassword(newPassword: string) {
    return await supabase.auth.updateUser({
      password: newPassword
    });
  },

  // Notifications
  async fetchNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching notifications:', error.message);
      return [];
    }

    return data.map(n => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      createdAt: n.created_at
    }));
  },

  async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  async markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  },

  async sendNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false
      });
    
    if (error) {
      console.error('[Supabase] Error sending notification:', error.message);
      // Fallback a localStorage para que al menos se vea en la sesión actual si falla la red
      const localNotifs = JSON.parse(localStorage.getItem('cardacademy_local_notifs') || '[]');
      localNotifs.push({
        id: `local_${Date.now()}`,
        userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('cardacademy_local_notifs', JSON.stringify(localNotifs));
    }
  }
};
