import { supabaseAdmin } from '../config/database.js';
import logger from '../utils/logger.js';

// ============= USER QUERIES =============

export const createUser = async (email, name, role = 'user', googleId = null, picture = null) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([{ email, name, role, google_id: googleId, picture }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const findUserByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
};

export const findUserById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, picture, created_at, industry, contact_number, address, profile_completed')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (id, profileData) => {
  const { name, industry, contact_number, address } = profileData;

  const updates = {
    updated_at: new Date().toISOString()
  };

  // Only add fields that are provided
  if (name !== undefined) updates.name = name;
  if (industry !== undefined) updates.industry = industry;
  if (contact_number !== undefined) updates.contact_number = contact_number;
  if (address !== undefined) updates.address = address;

  // Mark profile as completed if industry and contact_number are provided
  if (industry && contact_number) {
    updates.profile_completed = true;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============= DOCUMENT QUERIES =============

export const createDocument = async (title, description, price, fileUrl, adminId, folderId = null) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert([{
      title,
      description,
      price,
      file_url: fileUrl,
      admin_id: adminId,
      folder_id: folderId,
      status: 'active'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllDocuments = async (folderId = null, isAdmin = false) => {
  let query = supabaseAdmin
    .from('documents')
    .select('id, title, description, price, created_at, status, folder_id, is_visible')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Filter by folder if specified
  if (folderId !== null) {
    query = query.eq('folder_id', folderId);
  }

  // Regular users only see visible documents, admin sees all
  if (!isAdmin) {
    query = query.eq('is_visible', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getDocumentsByFolder = async (folderId) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, title, description, price, file_url, created_at, status, folder_id')
    .eq('folder_id', folderId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getDocumentById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateDocument = async (id, updates) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDocument = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .update({ status: 'inactive' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleDocumentVisibility = async (id) => {
  // First get current visibility status
  const { data: doc, error: fetchError } = await supabaseAdmin
    .from('documents')
    .select('is_visible')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Toggle the visibility
  const newVisibility = !doc.is_visible;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .update({ is_visible: newVisibility, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============= PURCHASE QUERIES =============

export const createPurchase = async (userId, documentId, paymentId, amount) => {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .insert([{
      user_id: userId,
      document_id: documentId,
      payment_id: paymentId,
      amount,
      status: 'completed'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const checkPurchaseExists = async (userId, documentId) => {
  logger.info(`Checking purchase access for user: ${userId}, document: ${documentId}`);

  // First check if user has lifetime subscription (document_id is NULL)
  const { data: lifetimeData, error: lifetimeError } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .is('document_id', null)
    .eq('status', 'completed')
    .limit(1)
    .single();

  logger.info(`Lifetime check result:`, {
    hasLifetime: !!lifetimeData,
    hasError: !!lifetimeError,
    errorCode: lifetimeError?.code
  });

  if (lifetimeError && lifetimeError.code !== 'PGRST116') throw lifetimeError;
  if (lifetimeData) {
    logger.info(`User has lifetime access`);
    return true; // User has lifetime access to all documents
  }

  // If no documentId provided, cannot check for specific document purchase
  if (!documentId) {
    logger.info(`No documentId provided and no lifetime subscription, returning false`);
    return false;
  }

  // Check for specific document purchase
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('document_id', documentId)
    .eq('status', 'completed')
    .single();

  logger.info(`Specific document purchase check:`, { hasPurchase: !!data });

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

export const getUserPurchases = async (userId) => {
  logger.info(`Getting purchases for user: ${userId}`);

  // Check for lifetime subscription (document_id is NULL)
  // Using limit(1).single() to get first record even if multiple exist
  const { data: lifetimeData, error: lifetimeError } = await supabaseAdmin
    .from('purchases')
    .select('id, amount, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .is('document_id', null)
    .limit(1)
    .single();

  logger.info(`Lifetime subscription query result:`, {
    hasData: !!lifetimeData,
    hasError: !!lifetimeError,
    errorCode: lifetimeError?.code,
    data: lifetimeData
  });

  // Throw error only if it's not a "not found" error
  if (lifetimeError && lifetimeError.code !== 'PGRST116') {
    logger.error(`Error getting lifetime purchases:`, lifetimeError);
    throw lifetimeError;
  }

  // If user has lifetime subscription, return it
  if (lifetimeData) {
    logger.info(`User has lifetime subscription, returning purchase data`);
    return [{
      id: lifetimeData.id,
      amount: lifetimeData.amount,
      purchased_at: lifetimeData.created_at,
      is_lifetime: true,
      document: null
    }];
  }

  // User hasn't purchased lifetime subscription yet
  logger.info(`No lifetime subscription found for user ${userId}`);
  return [];
};

// ============= PAYMENT QUERIES =============

export const createPayment = async (userId, documentId, stripeSessionId, amount) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert([{
      user_id: userId,
      document_id: documentId || null, // Explicitly convert falsy values to null
      stripe_session_id: stripeSessionId,
      amount,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePaymentStatus = async (stripeSessionId, status) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_session_id', stripeSessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPaymentBySessionId = async (stripeSessionId) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('stripe_session_id', stripeSessionId)
    .single();

  if (error) throw error;
  return data;
};

// ============= ADMIN QUERIES =============

export const getAllTransactionsWithPagination = async (limit = 20, offset = 0, filters = {}) => {
  let query = supabaseAdmin
    .from('payments')
    .select(`
      id,
      amount,
      status,
      created_at,
      updated_at,
      stripe_session_id,
      user:users!inner(id, email, name, role),
      document:documents(id, title)
    `)
    .order('created_at', { ascending: false })
    .neq('user.role', 'admin');

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    // Note: Supabase doesn't support nested filters easily, so we'll filter on backend after
    // For now, get all results and filter will be done in controller
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return { transactions: data || [], count };
};

export const getTransactionStats = async () => {
  // Get all payments excluding admin transactions
  const { data: allPayments, error: allError } = await supabaseAdmin
    .from('payments')
    .select('status, amount, user:users!inner(role)')
    .neq('user.role', 'admin');

  if (allError) throw allError;

  const totalPayments = allPayments.length;
  const completedPayments = allPayments.filter(p => p.status === 'completed');
  const failedPayments = allPayments.filter(p => p.status === 'failed' || p.status === 'expired');
  const pendingPayments = allPayments.filter(p => p.status === 'pending');

  const totalRevenue = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const successRate = totalPayments > 0 ? (completedPayments.length / totalPayments * 100).toFixed(2) : 0;

  return {
    totalRevenue,
    successRate,
    totalPayments,
    completedPayments: completedPayments.length,
    failedPayments: failedPayments.length,
    pendingPayments: pendingPayments.length
  };
};

export const getAllUsersWithSubscription = async (limit = 20, offset = 0, search = '') => {
  // Get users with their purchase info (excluding admins)
  let query = supabaseAdmin
    .from('users')
    .select(`
      id,
      email,
      name,
      role,
      created_at,
      purchases(id, amount, created_at, document_id, status)
    `)
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  // Process data to determine subscription status
  const users = data.map(user => {
    const hasLifetimeSubscription = user.purchases?.some(
      p => p.document_id === null && p.status === 'completed'
    );
    const lifetimePurchase = user.purchases?.find(
      p => p.document_id === null && p.status === 'completed'
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      hasLifetimeSubscription,
      subscriptionDate: lifetimePurchase?.created_at || null,
      subscriptionAmount: lifetimePurchase?.amount || null
    };
  });

  return { users };
};

// ============= FOLDER QUERIES =============

export const createFolder = async (name, parentId, adminId) => {
  const { data, error } = await supabaseAdmin
    .from('folders')
    .insert([{
      name,
      parent_id: parentId,
      admin_id: adminId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getFolderById = async (id) => {
  const { data, error} = await supabaseAdmin
    .from('folders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getAllFolders = async () => {
  const { data, error } = await supabaseAdmin
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const getFolderTree = async () => {
  // Get all folders
  const folders = await getAllFolders();

  // Build tree structure
  const folderMap = {};
  const rootFolders = [];

  // Create map for quick lookup
  folders.forEach(folder => {
    folderMap[folder.id] = { ...folder, children: [] };
  });

  // Build tree by assigning children to parents
  folders.forEach(folder => {
    if (folder.parent_id) {
      const parent = folderMap[folder.parent_id];
      if (parent) {
        parent.children.push(folderMap[folder.id]);
      }
    } else {
      // No parent = root folder
      rootFolders.push(folderMap[folder.id]);
    }
  });

  return rootFolders;
};

export const updateFolder = async (id, name) => {
  const { data, error } = await supabaseAdmin
    .from('folders')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFolder = async (id) => {
  // Delete folder (will cascade to children due to ON DELETE CASCADE)
  const { error } = await supabaseAdmin
    .from('folders')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

export const getFolderWithDocuments = async (id) => {
  // Get folder details
  const folder = await getFolderById(id);

  // Get documents in this folder
  const { data: documents, error } = await supabaseAdmin
    .from('documents')
    .select('id, title, description, price, created_at, status')
    .eq('folder_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    ...folder,
    documents
  };
};

export const moveFolderToParent = async (id, newParentId) => {
  // Validate: Cannot move folder to itself
  if (id === newParentId) {
    throw new Error('Cannot move folder to itself');
  }

  // Validate: Cannot move folder to its own descendant (prevent circular reference)
  if (newParentId) {
    const descendants = await getFolderDescendants(id);
    const descendantIds = descendants.map(d => d.id);
    if (descendantIds.includes(newParentId)) {
      throw new Error('Cannot move folder to its own descendant');
    }
  }

  const { data, error } = await supabaseAdmin
    .from('folders')
    .update({ parent_id: newParentId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper function to get all descendants of a folder
export const getFolderDescendants = async (id) => {
  const allFolders = await getAllFolders();
  const descendants = [];

  const findChildren = (parentId) => {
    const children = allFolders.filter(f => f.parent_id === parentId);
    children.forEach(child => {
      descendants.push(child);
      findChildren(child.id); // Recursively find nested children
    });
  };

  findChildren(id);
  return descendants;
};

// ============= SETTINGS QUERIES =============

export const getAllSettings = async () => {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*')
    .order('key', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getSettingByKey = async (key) => {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
};

export const updateSetting = async (key, value) => {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createSetting = async (key, value, description = null) => {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .insert([{ key, value, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
