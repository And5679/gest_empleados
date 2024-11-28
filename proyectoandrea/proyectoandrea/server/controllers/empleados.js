const connection = require('../config/database');
const empleadosController = {
  getEmpleados: async (req, res) => {
    try {
      const [rows] = await connection.query('SELECT * FROM empleados');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createEmpleado: async (req, res) => {
    try {
      const { nombre, edad, pais, cargo, anios } = req.body;
      await connection.query(
        'INSERT INTO empleados (nombre, edad, pais, cargo, anios) VALUES (?, ?, ?, ?, ?)',
        [nombre, edad, pais, cargo, anios]
      );
      res.json({ message: 'Empleado creado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateEmpleado: async (req, res) => {
    try {
      const { id, nombre, edad, pais, cargo, anios } = req.body;
      await connection.query(
        'UPDATE empleados SET nombre = ?, edad = ?, pais = ?, cargo = ?, anios = ? WHERE id = ?',
        [nombre, edad, pais, cargo, anios, id]
      );
      res.json({ message: 'Empleado actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  deleteEmpleado: async (req, res) => {
    try {
      const { id } = req.params;
      await connection.query('DELETE FROM empleados WHERE id = ?', [id]);
      res.json({ message: 'Empleado eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = empleadosController;
