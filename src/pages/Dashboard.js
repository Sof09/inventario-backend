import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStockBajo } from '../services/api';

function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [stockBajo, setStockBajo] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay sesion activa
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      navigate('/');
      return;
    }
    setUsuario(JSON.parse(usuarioGuardado));

    // Cargar productos con stock bajo
    const cargarStockBajo = async () => {
      try {
        const respuesta = await getStockBajo();
        setStockBajo(respuesta.data);
      } catch (error) {
        console.error('Error al cargar stock bajo:', error);
      }
    };

    cargarStockBajo();
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>Dashboard</h1>
          {usuario && (
            <p style={styles.subtitulo}>
              {usuario.nombre_negocio} — {usuario.rol}
            </p>
          )}
        </div>
        <button onClick={cerrarSesion} style={styles.botonCerrar}>
          Cerrar sesion
        </button>
      </div>

      <div style={styles.contenido}>
        <div style={styles.tarjeta} onClick={() => navigate('/productos')} >
          <h2 style={styles.tarjetaTitulo}>Productos</h2>
          <p style={styles.tarjetaTexto}>Ver y gestionar inventario</p>
        </div>

        {stockBajo.length > 0 && (
          <div style={styles.alerta}>
            <h3 style={styles.alertaTitulo}>
              Productos con stock bajo ({stockBajo.length})
            </h3>
            {stockBajo.map((p, i) => (
              <div key={i} style={styles.alertaItem}>
                <span>{p.nombre}</span>
                <span style={styles.alertaBadge}>
                  {p.stock_actual} / {p.stock_minimo} min
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '20px 24px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  titulo: {
    margin: 0,
    fontSize: '24px',
    color: '#1a1a2e'
  },
  subtitulo: {
    margin: '4px 0 0',
    color: '#888',
    fontSize: '14px'
  },
  botonCerrar: {
    padding: '8px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  contenido: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  tarjeta: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    border: '2px solid transparent'
  },
  tarjetaTitulo: {
    margin: '0 0 8px',
    color: '#4f46e5',
    fontSize: '18px'
  },
  tarjetaTexto: {
    margin: 0,
    color: '#888',
    fontSize: '14px'
  },
  alerta: {
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    padding: '20px',
    borderRadius: '12px'
  },
  alertaTitulo: {
    margin: '0 0 12px',
    color: '#c2410c',
    fontSize: '16px'
  },
  alertaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #fed7aa',
    fontSize: '14px'
  },
  alertaBadge: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '99px',
    fontSize: '12px'
  }
};

export default Dashboard;