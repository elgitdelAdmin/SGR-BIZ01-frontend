
import { useRef} from "react";
import "./Cargabilidad.scss"
import { useNavigate } from "react-router-dom";
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog'; 
import { useState } from "react";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import { Dialog } from 'primereact/dialog';


const Cargabilidad = () => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const [consultor, setConsultor] = useState('');
    const [consultorSeleccionado, setConsultorSeleccionado] = useState(null);
const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
const [visible, setVisible] = useState(false);

const handleEventClick = ({ event }) => {
  setEventoSeleccionado({
    titulo: event.title,
    inicio: event.startStr,
    fin: event.endStr,
    color: event.backgroundColor
  });
  setVisible(true);
};
const datosConsultores = [
  { id: 'leysi', nombre: 'Leysi Aurich' },
  { id: 'edgar', nombre: 'Edgar Camarena' }
];

const horariosConsultores = {
  leysi: [
    {
      title: 'Pruebas unitarias',
      start: '2025-06-17T08:30:00',
      end: '2025-06-17T11:00:00',
      color: '#42a5f5'
    },
    {
      title: 'Desarrollo ConectaBiz',
      start: '2025-06-17T11:30:00',
      end: '2025-06-17T13:00:00',
      color: '#66bb6a'
    },
    {
      title: 'Soporte Alicorp',
      start: '2025-06-18T09:00:00',
      end: '2025-06-18T12:00:00',
      color: '#ef5350'
    },
    {
      title: 'Documentación técnica',
      start: '2025-06-18T14:00:00',
      end: '2025-06-18T16:00:00',
      color: '#ffa726'
    },
    {
      title: 'Reunión interna',
      start: '2025-06-19T10:00:00',
      end: '2025-06-19T11:30:00',
      color: '#ab47bc'
    },
    {
      title: 'Capacitación Zoom',
      start: '2025-06-19T15:00:00',
      end: '2025-06-19T17:00:00',
      color: '#26c6da'
    }
  ],
  edgar: [
    {
      title: 'Revisión Proyecto Conecta',
      start: '2025-06-17T08:30:00',
      end: '2025-06-17T10:30:00',
      color: '#42a5f5'
    },
    {
      title: 'Soporte Alicorp',
      start: '2025-06-17T11:00:00',
      end: '2025-06-17T13:00:00',
      color: '#ef5350'
    },
    {
      title: 'Pruebas unitarias',
      start: '2025-06-18T09:00:00',
      end: '2025-06-18T11:00:00',
      color: '#66bb6a'
    },
    {
      title: 'Reunión interna',
      start: '2025-06-18T14:00:00',
      end: '2025-06-18T15:30:00',
      color: '#ab47bc'
    },
    {
      title: 'Desarrollo ConectaBiz',
      start: '2025-06-19T10:00:00',
      end: '2025-06-19T13:00:00',
      color: '#ffa726'
    },
    {
      title: 'Documentación técnica',
      start: '2025-06-19T14:00:00',
      end: '2025-06-19T16:00:00',
      color: '#26c6da'
    }
  ]
};



// const datosConsultores = {
//     "Leysi Aurich": [
//         {
//             title: 'Trabajo remoto',
//             start: '2025-06-17T08:30:00',
//             end: '2025-06-17T13:00:00',
//             color: '#42a5f5'
//         },
//         {
//             title: 'Marinera',
//             start: '2025-06-17T20:00:00',
//             end: '2025-06-17T21:00:00',
//             color: '#ab47bc'
//         }
//     ],
//     "Jheidy Aurich": [
//         {
//             title: 'Revisión Proyecto Conecta',
//             start: '2025-06-18T09:00:00',
//             end: '2025-06-18T11:00:00',
//             color: '#ef5350'
//         }
//     ]
// };

const actividades = datosConsultores[consultor] || [];

    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Cargabilidad</div>
            <div className="zv-usuario-body" style={{ marginTop: 16 }}>
                 <div className="p-fluid formgrid grid">
                  <div className="field col-12 md:col-6">
                    <label
                    className="label-form"
                    style={{
                        marginBottom: 8,
                        display: 'block',
                        color: 'rgb(45, 91, 151)',
                        fontSize: '16px', 
                        fontWeight: '600'
                    }}
                    >
                    Consultor:
                    </label>

                    <DropdownDefault
                        id="idConsultor"
                        name="idConsultor"
                        placeholder="Seleccione"
                        options={datosConsultores}
                        optionLabel="nombre"
                        optionValue="id"
                        value={consultorSeleccionado}
                        onChange={(e) => setConsultorSeleccionado(e.value)}
                    />
                    </div>
            </div>

            {consultorSeleccionado && (
                <div style={{ marginTop: '24px' }}>
                    <h4>Horario de {
                    datosConsultores.find(c => c.id === consultorSeleccionado)?.nombre
                    }</h4>

                   <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    allDaySlot={false}
                    slotMinTime="08:30:00"
                    slotMaxTime="18:00:00"
                    height="auto"
                    events={horariosConsultores[consultorSeleccionado]}
                    eventClick={handleEventClick}
                    />
                </div>
                )}
<Dialog header="Detalle del evento" visible={visible} style={{ width: '400px' }} onHide={() => setVisible(false)}>
  {eventoSeleccionado && (
    <div>
      <p><strong>Título:</strong> {eventoSeleccionado.titulo}</p>
      <p><strong>Inicio:</strong> {eventoSeleccionado.inicio}</p>
      <p><strong>Fin:</strong> {eventoSeleccionado.fin}</p>
    </div>
  )}
</Dialog>

            </div>
        </div>
     );
}
 
export default Cargabilidad;
