require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function resetAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the existing admin
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
        console.log('No admin found in DB. Will create one now...');
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('admin123', salt);
        const newAdmin = await User.create({
            name: 'Admin',
            email: 'admin@studentverse.com',
            password: hashedPw,
            isAdmin: true
        });
        console.log('Admin created:', newAdmin.email);
        await mongoose.disconnect();
        return;
    }

    console.log('Found existing admin:', admin.name, '|', admin.email);

    // Reset password and email
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash('admin123', salt);
    admin.email = 'admin@studentverse.com';
    admin.name = 'Admin';
    await admin.save();

    console.log('\n✅ Admin credentials reset successfully:');
    console.log('   Email   : admin@studentverse.com');
    console.log('   Password: admin123');
    console.log('   Secret  : STUDENTVERSE_ADMIN_2024');

    await mongoose.disconnect();
    console.log('\nDone.');
}

resetAdmin().catch(console.error);
