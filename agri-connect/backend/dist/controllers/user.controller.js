"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFarmerProfile = void 0;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
const getFarmerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await userService.getFarmerProfile(id);
        if (!profile) {
            return res.status(404).json({ message: 'Farmer profile not found' });
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getFarmerProfile = getFarmerProfile;
