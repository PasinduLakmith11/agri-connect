"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
const database_1 = __importDefault(require("../config/database"));
class RouteService {
    // Nearest Neighbor Algorithm for TSP
    async optimizeRoute(driverId) {
        // Get all pending orders
        const orders = database_1.default.prepare('SELECT * FROM orders WHERE status = "pending" OR status = "confirmed"').all();
        // Collect all points (Pickups -> Farmer locations, Deliveries -> Buyer locations)
        const points = [];
        for (const order of orders) {
            // Get product location (Farmer)
            const product = database_1.default.prepare('SELECT * FROM products WHERE id = ?').get(order.product_id);
            if (product && product.location_lat && product.location_lng) {
                points.push({
                    id: `pickup-${order.id}`,
                    lat: product.location_lat,
                    lng: product.location_lng,
                    address: product.address || 'Farmer Location',
                    type: 'pickup',
                    orderId: order.id
                });
            }
            // Get delivery location (Buyer)
            if (order.delivery_lat && order.delivery_lng) {
                points.push({
                    id: `delivery-${order.id}`,
                    lat: order.delivery_lat,
                    lng: order.delivery_lng,
                    address: order.delivery_address,
                    type: 'delivery',
                    orderId: order.id
                });
            }
        }
        if (points.length === 0)
            return [];
        // Simple clustering/ordering by nearest neighbor starting from a central depot (e.g. Colombo)
        // For now, let's assume driver starts at 6.9271, 79.8612 (Colombo)
        let currentPos = { lat: 6.9271, lng: 79.8612 };
        const route = [];
        const unvisited = [...points];
        while (unvisited.length > 0) {
            let nearestIdx = -1;
            let minDist = Infinity;
            for (let i = 0; i < unvisited.length; i++) {
                const dist = this.calculateDistance(currentPos.lat, currentPos.lng, unvisited[i].lat, unvisited[i].lng);
                // Constraint: Must pick up before delivery? 
                // For simplicity, we assume all pickups happen first or we don't enforce strict dependency in this simple demo version,
                // BUT a real TSP needs to respect pickup -> delivery precedence.
                // Let's just sort purely by distance for the demo, or prioritize pickups.
                // Heuristic: If it's a delivery, check if we visited its pickup.
                const point = unvisited[i];
                let canVisit = true;
                if (point.type === 'delivery') {
                    const pickupVisited = route.some(p => p.type === 'pickup' && p.orderId === point.orderId);
                    if (!pickupVisited)
                        canVisit = false;
                }
                if (canVisit && dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                }
            }
            // If no reachable point (e.g. only deliveries left but pickups not visited - shouldn't happen if we have pairs), 
            // just pick nearest pickup to unblock.
            if (nearestIdx === -1) {
                for (let i = 0; i < unvisited.length; i++) {
                    if (unvisited[i].type === 'pickup') {
                        const dist = this.calculateDistance(currentPos.lat, currentPos.lng, unvisited[i].lat, unvisited[i].lng);
                        if (dist < minDist) {
                            minDist = dist;
                            nearestIdx = i;
                        }
                    }
                }
            }
            if (nearestIdx !== -1) {
                const nextPoint = unvisited[nearestIdx];
                route.push(nextPoint);
                currentPos = { lat: nextPoint.lat, lng: nextPoint.lng };
                unvisited.splice(nearestIdx, 1);
            }
            else {
                break; // Should not happen
            }
        }
        return route;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}
exports.RouteService = RouteService;
