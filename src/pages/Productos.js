import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductos, crearProducto, eliminarProducto } from '../services/api';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    codigo_barras: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    id_categoria: null,
    id_proveedor: null,
    id_unidad: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    cargarProductos();
  }, [navigate]);

  const cargarProductos = async () => {
    try {
      const respuesta = await getProductos();
      setProductos(respuesta.data);
    } catch (error) {
      setError('Error al cargar productos');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearProducto(form);
      setForm({
        nombre: '', descripcion: '', codigo_barras: '',
        precio_compra: '', precio_venta: '',
        stock_actual: '', stock_minimo: '',
        id_categoria: null, id_proveedor: null, id_unidad: null
      });
      setMostrarForm(false);
      cargarProductos();
    } catch (error) {
      setError('Error al crear producto');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('Deseas desactivar este producto?')) {
      try {
        await eliminarProducto(id);
        cargarProductos();
      } catch (error) {
        setError('Error al desactivar producto');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.botonVolver}>
            Volver
          </button>
          <h1 style={styles.titulo}>Productos</h1>
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={styles.botonAgregar}>
          {mostrarForm ? 'Cancelar' : '+ Agregar producto'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {mostrarForm && (
        <div style={styles.formulario}>
          <h3 style={styles.formTitulo}>Nuevo producto</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <div style={styles.campo}>
                <label style={styles.label}>Nombre *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Codigo de barras</label>
                <input name="codigo_barras" value={form.codigo_barras} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Precio compra</label>
                <input name="precio_compra" type="number" value={form.precio_compra} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Precio venta</label>
                <input name="precio_venta" type="number" value={form.precio_venta} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Stock actual</label>
                <input name="stock_actual" type="number" value={form.stock_actual} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Stock minimo</label>
                <input name="stock_minimo" type="number" value={form.stock_minimo} onChange={handleChange} style={styles.input} />
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Descripcion</label>
              <input name="descripcion" value={form.descripcion} onChange={handleChange} style={styles.input} />
            </div>
            <button type="submit" style={styles.botonGuardar}>Guardar producto</button>
          </form>
        </div>
      )}

      {cargando ? (
        <p style={styles.cargando}>Cargando productos...</p>
      ) : (
        <div style={styles.tabla}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Precio compra</th>
                <th style={styles.th}>Precio venta</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Stock min</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.sinProductos}>
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id_producto} style={styles.tr}>
                    <td style={styles.td}>{p.nombre}</td>
                    <td style={styles.td}>${p.precio_compra}</td>
                    <td style={styles.td}>${p.precio_venta}</td>
                    <td style={{
                      ...styles.td,
                      color: p.stock_actual <= p.stock_minimo ? '#dc2626' : '#16a34a',
                      fontWeight: '600'
                    }}>
                      {p.stock_actual}
                    </td>
                    <td style={styles.td}>{p.stock_minimo}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleEliminar(p.id_producto)}
                        style={styles.botonEliminar}
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo: { margin: '4px 0 0', fontSize: '24px', color: '#1a1a2e' },
  botonVolver: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '4px' },
  botonAgregar: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  formulario: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitulo: { margin: '0 0 20px', color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' },
  campo: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontSize: '13px', fontWeight: '500' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  botonGuardar: { padding: '10px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  tabla: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600', borderBottom: '1px solid #eee' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  sinProductos: { padding: '40px', textAlign: 'center', color: '#888' },
  botonEliminar: { padding: '4px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px' },
  cargando: { textAlign: 'center', color: '#888', padding: '40px' }
};

export default Productos;