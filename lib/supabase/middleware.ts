import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export const createClient = (req: NextRequest, res: NextResponse) => 
  createMiddlewareClient({ req, res }) 