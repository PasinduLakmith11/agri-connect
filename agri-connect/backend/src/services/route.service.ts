import { db } from '../database';
import { orders, products, users } from '../database/schema';
import { eq, inArray, and } from 'drizzle-orm';

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
        if (!db) throw new Error('Database not initialized');

        // Get all pending, confirmed, and in-transit orders
        const orderRecords = await db.select()
            .from(orders)
            .where(inArray(orders.status, ['pending', 'confirmed', 'in_transit', 'delivered']));

        const points: Point[] = [];

        for (const order of orderRecords) {
            // Get product and farmer details
            const productResult = await db.select({
                product: products,
                farmer: users
            })
                .from(products)
                .leftJoin(users, eq(products.farmerId, users.id))
                .where(eq(products.id, order.productId))
                .limit(1);

            const { product, farmer } = productResult[0] || {};

            let pickupLat, pickupLng, pickupAddress, farmerName, farmerPhone;

            if (product && product.locationLat && product.locationLng) {
                pickupLat = product.locationLat;
                pickupLng = product.locationLng;
                pickupAddress = product.address || 'Farmer Product Location';
            }

            if (farmer) {
                farmerName = farmer.fullName;
                farmerPhone = farmer.phone;
                if (!pickupLat || !pickupLng) {
                    pickupLat = farmer.locationLat;
                    pickupLng = farmer.locationLng;
                    pickupAddress = farmer.address || 'Farmer Profile Location';
                }
            }

            if (pickupLat && pickupLng && order.status !== 'in_transit' && order.status !== 'delivered') {
                points.push({
                    id: `pickup-${order.id}`,
                    lat: pickupLat,
                    lng: pickupLng,
                    address: pickupAddress!,
                    type: 'pickup',
                    orderId: order.id,
                    details: {
                        productName: product ? product.name : 'Unknown Product',
                        quantity: order.quantity,
                        customerName: farmerName || 'Farmer',
                        customerPhone: farmerPhone || 'N/A',
                        paymentMethod: order.paymentMethod || 'cod',
                        paymentStatus: order.paymentStatus || 'pending',
                        totalPrice: order.totalPrice,
                        status: order.status as string
                    }
                });
            }

            // Get delivery location (Buyer)
            let deliveryLat, deliveryLng, deliveryAddress, buyerName, buyerPhone;

            if (order.deliveryLat && order.deliveryLng) {
                deliveryLat = order.deliveryLat;
                deliveryLng = order.deliveryLng;
                deliveryAddress = order.deliveryAddress;
            }

            if (order.buyerId) {
                const buyer = (await db.select().from(users).where(eq(users.id, order.buyerId)).limit(1))[0];
                if (buyer) {
                    buyerName = buyer.fullName;
                    buyerPhone = buyer.phone;
                    if (!deliveryLat || !deliveryLng) {
                        deliveryLat = buyer.locationLat;
                        deliveryLng = buyer.locationLng;
                        deliveryAddress = buyer.address || 'Buyer Profile Location';
                    }
                }
            }

            if (deliveryLat && deliveryLng) {
                points.push({
                    id: `delivery-${order.id}`,
                    lat: deliveryLat,
                    lng: deliveryLng,
                    address: deliveryAddress!,
                    type: 'delivery',
                    orderId: order.id,
                    details: {
                        productName: product ? product.name : 'Unknown Product',
                        quantity: order.quantity,
                        customerName: buyerName || 'Buyer',
                        customerPhone: buyerPhone || 'N/A',
                        paymentMethod: order.paymentMethod || 'cod',
                        paymentStatus: order.paymentStatus || 'pending',
                        totalPrice: order.totalPrice,
                        status: order.status as string
                    }
                });
            }
        }

        if (points.length === 0) return [];

        let currentPos = { lat: 6.9271, lng: 79.8612 }; // Colombo
        const route: Point[] = [];
        const unvisited = [...points];

        while (unvisited.length > 0) {
            let nearestIdx = -1;
            let minDist = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                const dist = this.calculateDistance(currentPos.lat, currentPos.lng, unvisited[i].lat, unvisited[i].lng);
                const point = unvisited[i];
                let canVisit = true;

                if (point.type === 'delivery') {
                    const pickupVisitedInRoute = route.some(p => p.type === 'pickup' && p.orderId === point.orderId);
                    const order = orderRecords.find(o => o.id === point.orderId);
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
                break;
            }
        }

        return route;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
