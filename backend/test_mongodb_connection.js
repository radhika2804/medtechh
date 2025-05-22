const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.1';

async function testConnection() {
    const client = new MongoClient(uri);
    
    try {
        // Attempt to connect
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        
        // Get database information
        const adminDb = client.db('admin');
        const serverInfo = await adminDb.command({ serverStatus: 1 });
        
        console.log('\nMongoDB Server Information:');
        console.log('Version:', serverInfo.version);
        console.log('Uptime (seconds):', serverInfo.uptime);
        console.log('Connections:', serverInfo.connections);
        
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    } finally {
        // Close the connection
        await client.close();
    }
}

testConnection(); 