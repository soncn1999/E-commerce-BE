const { default: mongoose } = require('mongoose');

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        if (conn.connection.readyState === 1) {
            // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
            console.log('DB Connected!');
        } else {
            console.log(conn.connection.readyState);
        }
    } catch (error) {
        console.log('DB Connection is fail: ' + error);
        throw new Error(error);
    }
}

module.exports = dbConnect;