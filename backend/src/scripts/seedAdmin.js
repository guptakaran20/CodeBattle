import { User } from '../modules/users/user.model.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
export const seedAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables. Admin user will not be seeded.');
        return;
    }
    try {
        const existingAdmin = await User.findOne({ email: adminEmail });
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        if (existingAdmin) {
            if (existingAdmin.role !== 'ADMIN') {
                existingAdmin.role = 'ADMIN';
                await existingAdmin.save();
                console.log(`✅ Updated existing user ${adminEmail} to ADMIN role.`);
            }
        }
        else {
            await User.create({
                name: 'System Administrator',
                username: 'admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                provider: 'local',
                isGoogleVerified: false
            });
            console.log(`✅ Seeded new ADMIN user: ${adminEmail}`);
        }
    }
    catch (error) {
        console.error('❌ Failed to seed admin user:', error);
    }
};
//# sourceMappingURL=seedAdmin.js.map