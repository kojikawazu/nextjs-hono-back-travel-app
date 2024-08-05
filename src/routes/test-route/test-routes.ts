import { Hono } from 'hono';

const test = new Hono();

test.get('/', (c) => c.text('Test, Hello'));

export default test;
