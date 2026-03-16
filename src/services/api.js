import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Agregar el token a todas las peticiones automaticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Servicios de usuario
export const login = (datos) => API.post('/usuarios/login', datos);

// Servicios de negocios
export const registrarNegocio = (datos) => API.post('/negocios/registro', datos);

// Servicios de productos
export const getProductos = () => API.get('/productos');
export const crearProducto = (datos) => API.post('/productos', datos);
export const editarProducto = (id, datos) => API.put(`/productos/${id}`, datos);
export const eliminarProducto = (id) => API.delete(`/productos/${id}`);
export const getStockBajo = () => API.get('/productos/stock-bajo');