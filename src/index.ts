import axios from 'axios';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import { yourTable } from './db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables
dotenv.config();

// Type definition for API response
interface ApiData {
  id: number;
  name: string;
  value: string;
  // Add more fields as needed
}

// Database configuration
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const db = drizzle(connectionString);

export async function fetchApiData(): Promise<ApiData[]> {
  try {
    const response = await axios.get<ApiData[]>(process.env.API_URL as string);
    return response.data;
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
}

export async function updateDatabase(data: ApiData[]): Promise<void> {
  try {
    // Using a transaction
    await db.transaction(async (tx) => {
      for (const item of data) {
        // Check if record exists
        const existing = await tx.select()
          .from(yourTable)
          .where(eq(yourTable.id, item.id))
          .limit(1);

        if (existing.length > 0) {
          // Update
          await tx.update(yourTable)
            .set({
              name: item.name,
              value: item.value
            })
            .where(eq(yourTable.id, item.id));
        } else {
          // Insert
          await tx.insert(yourTable)
            .values({
              id: item.id,
              name: item.name,
              value: item.value
            });
        }
      }
    });

    console.log(`Successfully updated ${data.length} records`);
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  }
}

async function main() {
  try {
    const data = await fetchApiData();
    await updateDatabase(data);
    console.log('Cron job completed successfully');
  } catch (error) {
    console.error('Cron job failed:', error);
    process.exit(1);
  }
}

// Only run main if this file is being run directly
if (require.main === module) {
  main();
} 