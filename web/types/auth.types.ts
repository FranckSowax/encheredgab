/**
 * Types pour l'authentification et la gestion des utilisateurs
 */

export type UserRole = 'bidder' | 'photo_team' | 'admin' | 'customs'
export type KYCStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  phone: string | null
  full_name: string | null
  created_at: string
  updated_at: string
  kyc_status: KYCStatus
  is_excluded: boolean
  exclusion_reason: string | null
  roles?: UserRole[]
}

export interface KYCDocument {
  id: string
  user_id: string
  document_type: string
  document_url: string
  status: KYCStatus
  rejection_reason: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface RegisterData {
  email: string
  phone: string
  password: string
  full_name: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
}
