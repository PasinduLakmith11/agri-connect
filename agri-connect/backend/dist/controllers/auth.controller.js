"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const agri_connect_shared_1 = require("agri-connect-shared");
const zod_1 = require("zod");
const authService = new auth_service_1.AuthService();
const register = async (req, res) => {
    try {
        const data = agri_connect_shared_1.RegisterSchema.parse(req.body);
        const result = await authService.register(data);
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const data = agri_connect_shared_1.LoginSchema.parse(req.body);
        const result = await authService.login(data);
        res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(401).json({ message: error.message });
    }
};
exports.login = login;
const me = (req, res) => {
    // req.user is set by authenticate middleware
    res.json(req.user);
};
exports.me = me;
