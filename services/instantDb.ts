
import { init, id } from '@instantdb/react';

// Use a placeholder App ID for the demonstration. 
// In a real scenario, this would be your actual InstantDB project ID.
const APP_ID = 'f9f95f54-928a-4486-a1c2-c01629928c06';

export const db = init({ appId: APP_ID });
export { id };
