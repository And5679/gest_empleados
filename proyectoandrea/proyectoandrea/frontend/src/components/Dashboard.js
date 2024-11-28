import './Dashboard.css';
import { useState, useEffect } from "react"; //Estado a los componentes -> "recordar"valores
import Axios from "axios"; //Hacer solicitud HTTP -> Servidor
import 'bootstrap/dist/css/bootstrap.min.css';

import Swal from 'sweetalert2'

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';

const API_URL = 'http://3.88.48.160:3001';

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const [nombre,setNombre] = useState("");
  const [edad,setEdad] = useState("");
  const [pais,setPais] = useState("");
  const [cargo,setCargo] = useState("");
  const [anios,setAnios] = useState("");
  const [id,setId] = useState("");

  const [editar,setEditar] = useState(false);

  const [empleadosList,setEmpleadosList] = useState([]);

  useEffect(() => {
    getEmpleados();
  }, []);

  //Crear
  const add = ()=>{
    Axios.post(`${API_URL}/create`,{
      nombre:nombre,
      edad:edad,
      pais:pais,
      cargo:cargo,
      anios:anios
    }).then(()=>{
      debouncedGetEmpleados();
      limpiarCampos();
      Swal.fire({
        title: "<strong>Registro exitoso!!!</strong>",
        html: "<i>El empleado <strong>"+nombre+"</strong> fue registrado con éxito!!!</i>",
        icon: 'success',
        timer:3000
      })
    }).catch(function(error){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: JSON.parse(JSON.stringify(error)).message==="Network Error"?"Intente más tarde":JSON.parse(JSON.stringify(error)).message
      });
    });
  }

  //Actualizar
  const update = () => {
    Axios.put(`${API_URL}/update`, {
      id: id,
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anios: anios
    }).then(() => {
      getEmpleados();
      limpiarCampos();
      Swal.fire({
        title: "<strong>Actualización exitosa!!!</strong>",
        html: "<i>El empleado <strong>"+nombre+"</strong> fue actualizado con éxito!!!</i>",
        icon: 'success',
        timer: 3000
      });
    }).catch(function(error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se logró actualizar el empleado!'
      });
    });
  };

  //Eliminado
  const deleteEmple = (val)=>{

    Swal.fire({
      title: 'Confirmar eliminado?',
      html: "<i>Realmente desea eliminar a <strong>"+val.nombre+"</strong>?</i>",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminarlo!'
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`${API_URL}/delete/${val.id}`).then((res)=>{
          getEmpleados();
          limpiarCampos();
          Swal.fire({
            icon: 'success',
            title: val.nombre+' fue eliminado.',
            showConfirmButton: false,
            timer: 2000
          });
        }).catch(function(error){
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se logró eliminar el empleado!',
            footer: JSON.parse(JSON.stringify(error)).message==="Network Error"?"Intente más tarde":JSON.parse(JSON.stringify(error)).message
          })
        });
        
      }
    });

    
  }

  const limpiarCampos = ()=>{
    setAnios("");
    setNombre("");
    setCargo("");
    setEdad("");
    setPais("");
    setId("");
    setEditar(false);
  }

  //Editar
    const editarEmpleado = (val)=>{
      setEditar(true);

      setNombre(val.nombre);
      setEdad(val.edad);
      setCargo(val.cargo);
      setPais(val.pais);
      setAnios(val.anios);
      setId(val.id);
    }
  

  const getEmpleados = () => {
    Axios.get(`${API_URL}/empleados`)
      .then((response) => {
        setEmpleadosList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching empleados:", error);
      });
  };

  const debouncedGetEmpleados = () => {
    clearTimeout(window.getEmpleadosTimeout);
    window.getEmpleadosTimeout = setTimeout(() => {
      getEmpleados();
    }, 500);
  };

  const generarInforme = () => {
    const doc = new jsPDF();
    
    // Configurar el título
    doc.setFontSize(18);
    doc.text('Informe de Empleados', 14, 22);
    
    // Preparar los datos para la tabla
    const headers = [['ID', 'Nombre', 'Edad', 'País', 'Cargo', 'Experiencia']];
    const data = empleadosList.map(empleado => [
      empleado.id,
      empleado.nombre,
      empleado.edad,
      empleado.pais,
      empleado.cargo,
      empleado.anios
    ]);

    // Generar la tabla
    doc.autoTable({
      head: headers,
      body: data,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      }
    });

    // Agregar fecha de generación
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${fecha}`, 14, doc.lastAutoTable.finalY + 10);

    // Descargar el PDF
    doc.save('informe-empleados.pdf');
  };

  const exportarExcel = () => {
    // Preparar los datos
    const datos = empleadosList.map(empleado => ({
      ID: empleado.id,
      Nombre: empleado.nombre,
      Edad: empleado.edad,
      País: empleado.pais,
      Cargo: empleado.cargo,
      'Años de Experiencia': empleado.anios
    }));

    // Crear libro y hoja
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(datos);

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(libro, hoja, "Empleados");

    // Generar el archivo y descargarlo
    XLSX.writeFile(libro, "empleados.xlsx");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleEdadChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setEdad(Number(value) || '');
    }
  };

  const handleAniosChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAnios(Number(value) || '');
    }
  };

  const camposVacios = () => {
    return Boolean(
      !nombre.trim() || 
      !edad || 
      edad <= 0 || 
      !pais.trim() || 
      !cargo.trim() || 
      !anios || 
      anios <= 0
    );
  };

  return (
    <div className="container mt-5">
      <div className="card text-center">
        <div className="card-header">
          Sistema de gestión de empleados
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Nombre:</span>
            <input type="text"
            onChange={(event)=>{
              setNombre(event.target.value);
            }}
            className="form-control" value={nombre} placeholder="Ingrese un nombre" aria-label="Username" aria-describedby="basic-addon1"/>
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Edad:</span>
            <input 
              type="number" 
              value={edad}
              onChange={handleEdadChange}
              className="form-control" 
              placeholder="Ingrese una edad" 
              min="0"
              max="120"
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Pais:</span>
            <input type="text" value={pais}
             onChange={(event)=>{
              setPais(event.target.value);
            }}
            className="form-control" placeholder="Ingrese un país" aria-label="Username" aria-describedby="basic-addon1"/>
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Cargo:</span>
            <input type="text" value={cargo}
             onChange={(event)=>{
              setCargo(event.target.value);
            }}
            className="form-control" placeholder="Ingrese un cargo" aria-label="Username" aria-describedby="basic-addon1"/>
          </div>
        

          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Años de experiencia:</span>
            <input 
              type="number" 
              value={anios}
              onChange={handleAniosChange}
              className="form-control" 
              placeholder="Ingrese los años" 
              min="0"
              max="120"
            />
          </div>

        </div>
        <div className="card-footer text-muted">
          {
            editar ? 
            <div>
              <button className='btn btn-warning m-2' onClick={update}>Actualizar</button> 
              <button className='btn btn-info m-2' onClick={limpiarCampos}>Cancelar</button>
            </div>
            :
            <div>
              <button 
                type="button"
                className='btn btn-success m-2' 
                onClick={add}
                disabled={camposVacios()}
              >
                Registrar
              </button>
              <button className='btn btn-primary m-2' onClick={generarInforme}>
                Generar PDF
              </button>
              <button className='btn btn-warning m-2' onClick={exportarExcel}>
                Exportar Excel
              </button>
              <button className='btn btn-danger m-2' onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          }
        </div>
      </div>

      <table className="table table-striped mt-5">
          <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Edad</th>
            <th scope="col">País</th>
            <th scope="col">Cargo</th>
            <th scope="col">Experiencia</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>

        {
            empleadosList.map((val,key)=>{
              return <tr key={val.id}>
                      <th>{val.id}</th>
                      <td>{val.nombre}</td>
                      <td>{val.edad}</td>
                      <td>{val.pais}</td>
                      <td>{val.cargo}</td>
                      <td>{val.anios}</td>
                      <td>
                      <div className="btn-group" role="group" aria-label="Basic example">
                        <button type="button"
                        onClick={()=>{
                          editarEmpleado(val);
                        }}
                        className="btn btn-info">Editar</button>
                        <button type="button" onClick={()=>{
                          deleteEmple(val);
                        }} className="btn btn-danger">Eliminar</button>
                      </div>
                      </td>
                    </tr>
              
            })
          }
          
          
        </tbody>  
      </table>


      </div>
    );
  }

  export default Dashboard;
