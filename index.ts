import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from 'bun';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { config } from './src/config';
import test from './src/routes/test-route/test-routes';
import projects from './src/routes/project-route/project-routes';

const app = new Hono();
const prisma = new PrismaClient();
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

app.use('*', cors({
  origin: config.corsAddress,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (c) => c.text('Hello, Hono!'));
app.route('/test-route', test);
app.route('/projects', projects);

serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`HTTP server running on port: ${config.port}`);