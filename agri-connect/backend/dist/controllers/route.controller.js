"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeRoute = void 0;
const route_service_1 = require("../services/route.service");
const routeService = new route_service_1.RouteService();
const optimizeRoute = async (req, res) => {
    try {
        // In a real app, we might take driver current location from req.body or user profile
        // And filter orders assigned to this driver.
        // For this demo, we optimize all pending orders.
        const route = await routeService.optimizeRoute('driver-1');
        res.json(route);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.optimizeRoute = optimizeRoute;
