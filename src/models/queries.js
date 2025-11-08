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
    .select('id, email, name, role, picture, created_at')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// ============= DOCUMENT QUERIES =============

export const createDocument = async (title, description, price, fileUrl, adminId) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert([{
      title,
      description,
      price,
      file_url: fileUrl,
      admin_id: adminId,
      status: 'active'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllDocuments = async () => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, title, description, price, created_at, status')
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
      document_id: documentId,
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
