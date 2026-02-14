import { Request, Response } from 'express';
import { RouteService } from '../services/route.service';

const routeService = new RouteService();

export const optimizeRoute = async (req: Request, res: Response) => {
    try {
        // In a real app, we might take driver current location from req.body or user profile
        // And filter orders assigned to this driver.
        // For this demo, we optimize all pending orders.
        const route = await routeService.optimizeRoute('driver-1');
        res.json(route);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
