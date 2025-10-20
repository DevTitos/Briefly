// src/routes/location.ts
import { Hono } from 'hono';

export const locationRouter = new Hono();

locationRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { latitude, longitude, city } = body;
    
    // Store location in your database or session
    // For now, we'll just return success
    console.log('User location saved:', { latitude, longitude, city });
    
    return c.json({ 
      success: true, 
      message: 'Location saved successfully',
      city 
    });
  } catch (error) {
    return c.json({ error: 'Failed to save location' }, 500);
  }
});