import dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET
}

export const passportConfig = {
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUrl: process.env.GOOGLE_REDIRECT_URL
}

// Define configurations for different environments
const devDatabaseConfig = {
    dbName: process.env.DB_NAME,
    userName: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const testDatabaseConfig = {
    dbName: process.env.TEST_DB_NAME,
    userName: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
};

// Determine which config to export based on NODE_ENV
const isTestEnv = process.env.NODE_ENV === 'test';
export const databaseConfig = isTestEnv ? testDatabaseConfig : devDatabaseConfig;
