import db from '../config/database';

interface Point {
    id: string;
    lat: number;
    lng: number;
    address: string;
    type: 'pickup' | 'delivery';
    orderId?: string;
    details?: {
        productName: string;
        quantity: number;
        customerName: string;
        customerPhone: string;
        paymentMethod: string;
        paymentStatus: string;
        totalPrice: number;
        status: string;
    };
}

export class RouteService {
    // Nearest Neighbor Algorithm for TSP
    async optimizeRoute(driverId: string): Promise<Point[]> {
        // Get all pending, confirmed, and in-transit orders
        const orders = db.prepare("SELECT * FROM orders WHERE status IN ('pending', 'confirmed', 'in_transit', 'delivered')").all() as any[];

        // Collect all points (Pickups -> Farmer locations, Deliveries -> Buyer locations)
        const points: Point[] = [];

        for (const order of orders) {
            // Get product location (Farmer)
            const product = db.prepare('SELECT * FROM products WHERE id = ?').get(order.product_id) as any;

            let pickupLat, pickupLng, pickupAddress, farmerName, farmerPhone;

            if (product && product.location_lat && product.location_lng) {
                pickupLat = product.location_lat;
                pickupLng = product.location_lng;
                pickupAddress = product.address || 'Farmer Product Location';
            }

            // Always fetch farmer details for contact info
            if (product && product.farmer_id) {
                const farmer = db.prepare('SELECT * FROM users WHERE id = ?').get(product.farmer_id) as any;
                if (farmer) {
                    farmerName = farmer.full_name || farmer.farm_name;
                    farmerPhone = farmer.phone;
                    // Fallback location if needed
                    if (!pickupLat || !pickupLng) {
                        pickupLat = farmer.location_lat;
                        pickupLng = farmer.location_lng;
                        pickupAddress = farmer.farm_name || farmer.address || 'Farmer Profile Location';
                    }
                }
            }

            if (pickupLat && pickupLng && order.status !== 'in_transit' && order.status !== 'delivered') {
                points.push({
                    id: `pickup-${order.id}`,
                    lat: pickupLat,
                    lng: pickupLng,
                    address: pickupAddress,
                    type: 'pickup',
                    orderId: order.id,
                    details: {
                        productName: product ? product.name : 'Unknown Product',
                        quantity: order.quantity,
                        customerName: farmerName || 'Farmer',
                        customerPhone: farmerPhone || 'N/A',
                        paymentMethod: order.payment_method,
                        paymentStatus: order.payment_status,
                        totalPrice: order.total_price,
                        status: order.status
                    }
                });
            }

            // Get delivery location (Buyer)
            let deliveryLat, deliveryLng, deliveryAddress, buyerName, buyerPhone;

            if (order.delivery_lat && order.delivery_lng) {
                deliveryLat = order.delivery_lat;
                deliveryLng = order.delivery_lng;
                deliveryAddress = order.delivery_address;
            }

            if (order.buyer_id) {
                // Fetch Buyer User Profile
                const buyer = db.prepare('SELECT * FROM users WHERE id = ?').get(order.buyer_id) as any;
                if (buyer) {
                    buyerName = buyer.full_name;
                    buyerPhone = buyer.phone;
                    // Fallback location
                    if (!deliveryLat || !deliveryLng) {
                        deliveryLat = buyer.location_lat;
                        deliveryLng = buyer.location_lng;
                        deliveryAddress = buyer.address || 'Buyer Profile Location';
                    }
                }
            }

            if (deliveryLat && deliveryLng) {
                points.push({
                    id: `delivery-${order.id}`,
                    lat: deliveryLat,
                    lng: deliveryLng,
                    address: deliveryAddress,
                    type: 'delivery',
                    orderId: order.id,
                    details: {
                        productName: product ? product.name : 'Unknown Product',
                        quantity: order.quantity,
                        customerName: buyerName || 'Buyer',
                        customerPhone: buyerPhone || 'N/A',
                        paymentMethod: order.payment_method,
                        paymentStatus: order.payment_status,
                        totalPrice: order.total_price,
                        status: order.status
                    }
                });
            }
        }

        if (points.length === 0) return [];

        // Simple clustering/ordering by nearest neighbor starting from a central depot (e.g. Colombo)
        // For now, let's assume driver starts at 6.9271, 79.8612 (Colombo)
        let currentPos = { lat: 6.9271, lng: 79.8612 };
        const route: Point[] = [];
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
                    const pickupVisitedInRoute = route.some(p => p.type === 'pickup' && p.orderId === point.orderId);
                    const order = orders.find(o => o.id === point.orderId);
                    const isAlreadyInTransit = order?.status === 'in_transit';

                    if (!pickupVisitedInRoute && !isAlreadyInTransit) {
                        canVisit = false;
                    }
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
            } else {
                break; // Should not happen
            }
        }

        return route;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
