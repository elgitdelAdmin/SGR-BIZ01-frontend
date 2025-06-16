
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import { Toast } from 'primereact/toast';

const Dashboard = () => {
    const navigate = useNavigate();

    return ( 
           <div className="zv-usuario" style={{paddingTop:16}}>
                    <ConfirmDialog />
                    <Toast position="top-center"></Toast>
                    <div className="header-titulo">Dashboard</div>
                   
                </div>
     );
}
 
export default Dashboard;