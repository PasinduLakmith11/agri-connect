import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { CreateProductSchema } from 'agri-connect-shared';
import { z } from 'zod';

const productService = new ProductService();

export const createProduct = async (req: Request, res: Response) => {
    try {
        // Parse body (some fields might be strings due to FormData)
        const rawData = {
            ...req.body,
            quantity: parseFloat(req.body.quantity),
            base_price: parseFloat(req.body.base_price),
            location_lat: req.body.location_lat ? parseFloat(req.body.location_lat) : undefined,
            location_lng: req.body.location_lng ? parseFloat(req.body.location_lng) : undefined,
        };

        const data = CreateProductSchema.parse(rawData);

        const imagePaths = (req.files as Express.Multer.File[])?.map(f => `/uploads/${f.filename}`) || [];

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const product = await productService.create(data, req.user.userId, imagePaths);
        res.status(201).json(product);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: (error as z.ZodError).errors });
        }
        res.status(400).json({ message: error.message });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const filters = req.query;
        const products = await productService.findAll(filters);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await productService.findById(req.params.id as string);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePrice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { base_price, current_price } = req.body;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const product = await productService.updatePrice(
            id,
            parseFloat(base_price),
            parseFloat(current_price),
            req.user.userId
        );

        const { socketService } = require('../services/socket.service');
        socketService.broadcast('price_update', {
            productId: id,
            newPrice: product.current_price
        });

        res.json(product);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rawData = {
            ...req.body,
            quantity: req.body.quantity ? parseFloat(req.body.quantity) : undefined,
            base_price: req.body.base_price ? parseFloat(req.body.base_price) : undefined,
            current_price: req.body.current_price ? parseFloat(req.body.current_price) : undefined,
            location_lat: req.body.location_lat ? parseFloat(req.body.location_lat) : undefined,
            location_lng: req.body.location_lng ? parseFloat(req.body.location_lng) : undefined,
        };

        const data = CreateProductSchema.partial().parse(rawData);

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const product = await productService.update(id, data, req.user.userId);

        const { socketService } = require('../services/socket.service');
        socketService.broadcast('product_updated', product);
        if (data.current_price !== undefined) {
            socketService.broadcast('price_update', {
                productId: id,
                newPrice: product.current_price
            });
        }

        res.json(product);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        await productService.delete(id, req.user.userId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
