import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const getFarmerProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profile = await userService.getFarmerProfile(id);

        if (!profile) {
            return res.status(404).json({ message: 'Farmer profile not found' });
        }

        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const updates = req.body;

        // Handle profile image upload
        if (req.file) {
            // Assuming static serve at /uploads
            updates.profile_image = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await userService.update(req.user.userId, updates);
        res.json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
