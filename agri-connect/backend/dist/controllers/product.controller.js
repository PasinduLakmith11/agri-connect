"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.updatePrice = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const product_service_1 = require("../services/product.service");
const agri_connect_shared_1 = require("agri-connect-shared");
const zod_1 = require("zod");
const productService = new product_service_1.ProductService();
const createProduct = async (req, res) => {
    try {
        // Parse body (some fields might be strings due to FormData)
        const rawData = {
            ...req.body,
            quantity: parseFloat(req.body.quantity),
            base_price: parseFloat(req.body.base_price),
            location_lat: req.body.location_lat ? parseFloat(req.body.location_lat) : undefined,
            location_lng: req.body.location_lng ? parseFloat(req.body.location_lng) : undefined,
        };
        const data = agri_connect_shared_1.CreateProductSchema.parse(rawData);
        const imagePaths = req.files?.map(f => `/uploads/${f.filename}`) || [];
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const product = await productService.create(data, req.user.userId, imagePaths);
        res.status(201).json(product);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const filters = req.query;
        const products = await productService.findAll(filters);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const product = await productService.findById(req.params.id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductById = getProductById;
const updatePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { base_price, current_price } = req.body;
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const product = await productService.updatePrice(id, parseFloat(base_price), parseFloat(current_price), req.user.userId);
        const { socketService } = require('../services/socket.service');
        socketService.broadcast('price_update', {
            productId: id,
            newPrice: product.current_price
        });
        res.json(product);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updatePrice = updatePrice;
const updateProduct = async (req, res) => {
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
        const data = agri_connect_shared_1.CreateProductSchema.partial().parse(rawData);
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        await productService.delete(id, req.user.userId);
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
