const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleados');

router.get('/empleados', empleadosController.getEmpleados);
router.post('/create', empleadosController.createEmpleado);
router.put('/update', empleadosController.updateEmpleado);
router.delete('/delete/:id', empleadosController.deleteEmpleado);

module.exports = router;
